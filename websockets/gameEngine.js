const ERROR_CODES = {
    NOT_PLAYING: 10,
    GAME_ENDED: 11,
    INVALID_TURN: 12,
    INVALID_MOVE: 13,
    GAME_NOT_ENDED: 14,
};

const ERROR_MESSAGES = {
    NOT_PLAYING: "You are not playing this game!",
    GAME_ENDED: "Game has already ended!",
    INVALID_TURN: "Invalid play: It is not your turn!",
    INVALID_MOVE: "Invalid move: card already flipped or matched!",
    GAME_NOT_ENDED: "Cannot close a game that has not ended!",
};

exports.createGameEngine = () => {
    const initGame = (gameFromDB) => {
        gameFromDB.gameStatus = 0; // Game not started
        gameFromDB.currentPlayer = 1; // Player 1 starts
        gameFromDB.pairsDiscovered = { 1: 0, 2: 0 };
        gameFromDB.turns = { 1: 0, 2: 0 };
        gameFromDB.size = gameFromDB.board.cols * gameFromDB.board.rows;
        gameFromDB.board = createCardPairs(gameFromDB.size);
        gameFromDB.matchedPairs = [];
        gameFromDB.flippedCards = [];
        return gameFromDB;
    };

    const createCardPairs = (boardSize) => {
        if (boardSize % 2 !== 0) {
            throw new Error("Board size must be an even number");
        }

        const cardTypes = ["e", "o", "p", "c"];
        const cardValues = [1, 2, 3, 4, 5, 6, 7, 11, 12, 13];

        const cardCombinations = cardTypes.flatMap((type) =>
            cardValues.map((value) => `${type}${value}`)
        );

        if (boardSize / 2 > cardCombinations.length) {
            throw new Error("Board size is too large for the available card combinations");
        }

        const selectedCombinations = cardCombinations
            .sort(() => Math.random() - 0.5)
            .slice(0, boardSize / 2);

        const shuffledCards = [...selectedCombinations, ...selectedCombinations]
            .sort(() => Math.random() - 0.5)
            .map((cardCode, index) => ({
                id: index,
                value: cardCode,
                isFlipped: false,
                isMatched: false,
            }));

        return shuffledCards;
    };

    const pairsDiscoveredFor = (game, player_id) => {
        game.pairsDiscovered[player_id] += 1;
    };

    const gameEnded = (game) => game.gameStatus !== 0;

    const play = (game, index, playerSocketId, roomName, io) => {
        if (!isPlayerInGame(game, playerSocketId)) {
            return createErrorResponse(ERROR_CODES.NOT_PLAYING, ERROR_MESSAGES.NOT_PLAYING);
        }
        if (gameEnded(game)) {
            return createErrorResponse(ERROR_CODES.GAME_ENDED, ERROR_MESSAGES.GAME_ENDED);
        }
        if (!isPlayerTurn(game, playerSocketId)) {
            return createErrorResponse(ERROR_CODES.INVALID_TURN, ERROR_MESSAGES.INVALID_TURN);
        }

        const card = game.board[index];
        if (card.isFlipped || card.isMatched) {
            return createErrorResponse(ERROR_CODES.INVALID_MOVE, ERROR_MESSAGES.INVALID_MOVE);
        }

        // Flip the card
        card.isFlipped = true;
        game.flippedCards.push(card);
        io.to(roomName).emit("gameChanged", game);

        if (game.flippedCards.length === 2) {
            game.turns[game.currentPlayer] += 1;
            const [firstCard, secondCard] = game.flippedCards;

            if (firstCard.value === secondCard.value) {
                firstCard.isMatched = true;
                secondCard.isMatched = true;
                game.matchedPairs.push(firstCard.value);
                game.flippedCards = [];
                pairsDiscoveredFor(game, game.currentPlayer);
                changeGameStatus(game);
                io.to(roomName).emit("gameChanged", game);
            } else {
                setTimeout(() => {
                    firstCard.isFlipped = false;
                    secondCard.isFlipped = false;
                    game.flippedCards = [];
                    game.currentPlayer = game.currentPlayer === 1 ? 2 : 1;
                    io.to(roomName).emit("gameChanged", game);
                }, 1000);
            }
        }

        return true;
    };

    const changeGameStatus = (game) => {
        if (isGameComplete(game)) {
            if (game.pairsDiscovered[1] === game.pairsDiscovered[2]) {
                game.gameStatus = game.currentPlayer === 1 ? 2 : 1;
            } else {
                game.gameStatus = game.pairsDiscovered[1] > game.pairsDiscovered[2] ? 1 : 2;
            }
            game.status = "E";
        }
    };

    const isGameComplete = (game) => game.matchedPairs.length === game.size / 2;

    const quit = (game, playerSocketId) => {
        if (!isPlayerInGame(game, playerSocketId)) {
            return createErrorResponse(ERROR_CODES.NOT_PLAYING, ERROR_MESSAGES.NOT_PLAYING);
        }
        if (gameEnded(game)) {
            return createErrorResponse(ERROR_CODES.GAME_ENDED, ERROR_MESSAGES.GAME_ENDED);
        }
        game.gameStatus = playerSocketId === game.player1SocketId ? 2 : 1;
        game.status = "E";
        return true;
    };

    const close = (game, playerSocketId) => {
        if (!isPlayerInGame(game, playerSocketId)) {
            return createErrorResponse(ERROR_CODES.NOT_PLAYING, ERROR_MESSAGES.NOT_PLAYING);
        }
        if (!gameEnded(game)) {
            return createErrorResponse(ERROR_CODES.GAME_NOT_ENDED, ERROR_MESSAGES.GAME_NOT_ENDED);
        }
        return true;
    };

    const isPlayerInGame = (game, playerSocketId) => {
        return playerSocketId === game.player1SocketId || playerSocketId === game.player2SocketId;
    };

    const isPlayerTurn = (game, playerSocketId) => {
        return (game.currentPlayer === 1 && playerSocketId === game.player1SocketId) ||
               (game.currentPlayer === 2 && playerSocketId === game.player2SocketId);
    };

    const createErrorResponse = (errorCode, errorMessage) => {
        return { errorCode, errorMessage };
    };

    return {
        initGame,
        gameEnded,
        play,
        quit,
        close,
    };
};