import { ref, computed, inject } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useErrorStore } from '@/stores/error'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/components/ui/toast/use-toast'

export const useMultiplayerStore = defineStore('multiplayer', () => {
    const storeAuth = useAuthStore()
    const storeError = useErrorStore()
    const { toast } = useToast()
    const socket = inject('socket')

    const games = ref([])

    const totalGames = computed(() => games.value.length)

    // Use this function to update the game object in the games array
    const updateGame = (game) => {
        const gameIndex = games.value.findIndex((g) => g.id === game.id)
        if (gameIndex !== -1) {
            games.value[gameIndex] = { ...game } // shallow copy
        }
    }

    const playerNumberOfCurrentUser = (game) => {
        if (game.player1?.id === storeAuth.userId) {
            return 1
        }
        if (game.player2?.id === storeAuth.userId) {
            return 2
        }
        return null
    }

    const webSocketServerResponseHasError = (response) => {
        if (response.errorCode) {
            storeError.setErrorMessages(response.errorMessage, [], response.errorCode)
            return true
        }
        return false
    }

    const removeGameFromList = (game) => {
        const gameIndex = games.value.findIndex((g) => g.id === game.id)
        if (gameIndex >= 0) {
            games.value.splice(gameIndex, 1)
        }
    }

    // fetch playing games from the Websocket server
    const fetchPlayingGames = () => {
        storeError.resetMessages()
        socket.emit('fetchPlayingGames', (response) => {
            if (webSocketServerResponseHasError(response)) {
                return
            }
            games.value = response
        })
    }

    const play = (game, idx) => {
        storeError.resetMessages()
        socket.emit('play', {
            index: idx,
            gameId: game.id
        }, (response) => {
            if (webSocketServerResponseHasError(response)) {
                return
            }
            updateGame(response)
        })
    }

    const quit = (game) => {
        storeError.resetMessages()
        socket.emit('quitGame', game.id, (response) => {
            if (webSocketServerResponseHasError(response)) {
                return
            }
            removeGameFromList(game)
        })
    }

    const close = (game) => {
        storeError.resetMessages()
        socket.emit('closeGame', game.id, (response) => {
            if (webSocketServerResponseHasError(response)) {
                return
            }
            removeGameFromList(game)
        })
    }

    socket.on('gameStarted', async (game) => {
        if (game.player1_id === storeAuth.userId) {
            toast({
                title: 'Game Started',
                description: `Game #${game.id} has started!`,
            })
        }
        fetchPlayingGames()
    })

    socket.on('gameEnded', async (game) => {
        updateGame(game)
        // Player that created the game is responsible for updating on the database
        if (playerNumberOfCurrentUser(game) === 1) {
            const APIresponse = await axios.put('games/' + game.id, {
                status: 'E',
                winner_id: game.gameStatus === 1 ? game.player1_id : (game.gameStatus === 2 ? game.player2_id : null),
            })
            const updatedGameOnDB = APIresponse.data.data
            console.log('Game has ended and updated on the database: ', updatedGameOnDB)
        }
    })

    socket.on('gameChanged', (game) => {
        updateGame(game)
    })

    socket.on('gameQuitted', async (payload) => {
        if (payload.userQuit.id != storeAuth.userId) {
            toast({
                title: 'Game Quit',
                description: `${payload.userQuit.name} has quitted game #${payload.game.id}, giving you the win!`,
            })
        }
        updateGame(payload.game)
    })

    socket.on('gameInterrupted', async (game) => {
        updateGame(game)
        toast({
            title: 'Game Interruption',
            description: `Game #${game.id} was interrupted because your opponent has gone offline!`,
            variant: 'destructive'
        })
        const APIresponse = await axios.patch('games/' + game.id, {
            status: 'interrupted',
            winner_id: game.gameStatus === 1 ? game.player1_id : (game.gameStatus === 2 ? game.player2_id : null),
        })
        const updatedGameOnDB = APIresponse.data.data
        console.log('Game was interrupted and updated on the database: ', updatedGameOnDB)
    })

    /*
    // GAMEBOARD  
    // Game Initialization
    const cards = ref([])
    const selectedCards = ref([])
    const matchedCards = ref([])
    const isGameWon = ref(false)
    const boardId = ref(null)
    const turnCount = ref(0)
    const mode = ref(null)
    const currentGameId = ref(null)
    const gridConfig = computed(() => {
        switch (mode.value) {
            case '3x4': return { rows: 3, cols: 4 }
            case '4x4': return { rows: 4, cols: 4 }
            case '6x6': return { rows: 6, cols: 6 }
            default: return { rows: 0, cols: 0 }
        }
    })
    const initializeGame = async (gameMode) => {
        // Determine board_id based on game mode
        switch (gameMode) {
            case '3x4':
                boardId.value = 1
                break
            case '4x4':
                boardId.value = 2
                break
            case '6x6':
                boardId.value = 3
                break
        }

        // Reset game state
        // mode.value = gameMode
        // turnCount.value = 0
        // matchedCards.value = []
        // selectedCards.value = []
        // isGameWon.value = false
        // elapsedTime.value = 0
        // currentGameId.value = null


        // Card Generation and other existing initialization logic...
        const suits = ['c', 'e', 'p', 'o']
        const totalCards = gridConfig.value.rows * gridConfig.value.cols

        const cardSet = suits.flatMap(suit =>
            Array.from({ length: 7 }, (_, i) => ({
                id: `${suit}${i + 1}`,
                image: `/${suit}${i + 1}.png`,
                isFlipped: false
            })).concat(
                Array.from({ length: 3 }, (_, i) => ({
                    id: `${suit}${i + 11}`,
                    image: `/${suit}${i + 11}.png`,
                    isFlipped: false
                }))
            )
        )

        // Select and shuffle cards
        cards.value = cardSet.slice(0, totalCards / 2).flatMap(card => [
            { ...card, uniqueKey: Math.random() },
            { ...card, uniqueKey: Math.random() }
        ]).sort(() => Math.random() - 0.5)

        // Start the timer
        // startTimer()
    }

    // Card Interaction
    const flipCard = (card) => {
        if (
            matchedCards.value.includes(card.id) ||
            selectedCards.value.length === 2 ||
            selectedCards.value.find(c => c.uniqueKey === card.uniqueKey)
        ) return

        card.isFlipped = true
        selectedCards.value.push(card)

        if (selectedCards.value.length === 2) {
            turnCount.value++

            setTimeout(() => {
                if (selectedCards.value[0].id === selectedCards.value[1].id) {
                    matchedCards.value.push(selectedCards.value[0].id)
                } else {
                    selectedCards.value.forEach(c => {
                        const cardToFlip = cards.value.find(card => card.uniqueKey === c.uniqueKey)
                        if (cardToFlip) cardToFlip.isFlipped = false
                    })
                }
                selectedCards.value = []

                checkGameCompletion()
            }, 1000)
        }
    }

    */

    return {
        games, totalGames, playerNumberOfCurrentUser, fetchPlayingGames, play, quit, close,
    }
})
