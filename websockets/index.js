const { createUtil } = require('./util');
const util = createUtil();

const { createLobby } = require('./lobby');
const lobby = createLobby();

const { createGameEngine } = require('./gameEngine');
const gameEngine = createGameEngine();

const httpServer = require('http').createServer();
const io = require("socket.io")(httpServer, {
  cors: {
    origin: '*',
    methods: ["GET", "POST"],
    credentials: true
  }
});

httpServer.listen(3000, () => {
  console.log('listening on *:3000');
});

io.on('connection', (socket) => {
  console.log(`Client with socket id ${socket.id} has connected!`);

  // ------------------------------------------------------
  // Chat and Private Messages
  // ------------------------------------------------------    
  socket.on('chatMessage', (message) => {
    const payload = {
      user: socket.data.user,
      message: message,
    };
    io.sockets.emit('chatMessage', payload);
  });

  socket.on('privateMessage', (clientMessageObj, callback) => {
    const destinationRoomName = 'user_' + clientMessageObj?.destinationUser?.id;

    // Check if the destination user is online
    if (io.sockets.adapter.rooms.get(destinationRoomName)) {
      const payload = {
        user: socket.data.user,
        message: clientMessageObj.message,
      };
      // send the "privateMessage" to the destination user (using "his" room)
      io.to(destinationRoomName).emit('privateMessage', payload);
      if (callback) {
        callback({ success: true });
      }
    } else {
      if (callback) {
        callback({
          errorCode: 1,
          errorMessage: `User "${clientMessageObj?.destinationUser?.name}" is not online!`
        });
      }
    }
  });

  // ------------------------------------------------------
  // Lobby
  // ------------------------------------------------------

  socket.on('fetchGames', (callback) => {
    if (!util.checkAuthenticatedUser(socket, callback)) {
      return
    }
    const games = lobby.getGames()
    if (callback) {
      callback(games)
    }
  })

  socket.on('addGame', (gameId, callback) => {
    if (!util.checkAuthenticatedUser(socket, callback)) {
      return
    }
    console.log('gameId:', gameId)
    const game = lobby.addGame(socket.data.user, socket.id, gameId)
    console.log('Game created:', game);
    io.to('lobby').emit('lobbyChanged', lobby.getGames())
    if (callback) {
      callback(game)
    }
  })
  socket.on('joinGame', (id, callback) => {
    if (!util.checkAuthenticatedUser(socket, callback)) {
      return
    }
    console.log('Available sockets:', Array.from(io.sockets.sockets.keys()));

    const game = lobby.getGame(id)
    if (socket.data.user.id == game.player1.id) {
      if (callback) {
        callback({
          errorCode: 3,
          errorMessage: 'User cannot join a game that he created!'
        })
      }
      return
    }
    game.player2 = socket.data.user
    game.player2SocketId = socket.id
    lobby.removeGame(id)
    io.to('lobby').emit('lobbyChanged', lobby.getGames())
    if (callback) {
      callback(game)
    }
  })

  socket.on('removeGame', (id, callback) => {
    if (!util.checkAuthenticatedUser(socket, callback)) {
      return
    }
    const game = lobby.getGame(id)
    if (socket.data.user.id != game.player1.id) {
      if (callback) {
        callback({
          errorCode: 4,
          errorMessage: 'User cannot remove a game that he has not created!'
        })
      }
      return
    }
    lobby.removeGame(game.id)
    io.to('lobby').emit('lobbyChanged', lobby.getGames())
    if (callback) {
      callback(game)
    }
  })

  // ------------------------------------------------------ 
  // Disconnect 
  // ------------------------------------------------------    


  // disconnection event is triggered when the client disconnects but is still on the rooms      
  socket.on("disconnecting", (reason) => {
    socket.rooms.forEach(room => {
      if (room == 'lobby') {
        lobby.leaveLobby(socket.id)
        io.to('lobby').emit('lobbyChanged', lobby.getGames())
      }
    })
  })

  // ------------------------------------------------------ 
  // User identity 
  // ------------------------------------------------------     

  socket.on('login', (user) => {
    // Stores user information on the socket as "user" property 
    socket.data.user = user
    if (user && user.id) {
      socket.join('user_' + user.id)
      socket.join('lobby')
      //console.log(`User ${user.id} has joined the lobby.`);
    }
  })

  socket.on('logout', (user) => {
    if (user && user.id) {
      socket.leave('user_' + user.id)
      lobby.leaveLobby(socket.id)
      io.to('lobby').emit('lobbyChanged', lobby.getGames())
      socket.leave('lobby')
    }
    socket.data.user = undefined
  })


  // ------------------------------------------------------
  // Multiplayer Game
  // ------------------------------------------------------

  socket.on('startGame', (clientGame, callback) => {
    if (!util.checkAuthenticatedUser(socket, callback)) {
      return;
    }
    const roomName = 'game_' + clientGame.id;
    console.log('Client Game:', clientGame);
  
    const game = gameEngine.initGame({
      ...clientGame,
      board: {
        cols: 4, //estatico
        rows: 4  
      }
    });
  
    console.log('Game:', game);

    // Join the 2 players to the game room
    io.sockets.sockets.get(game.player1SocketId)?.join(roomName);
    io.sockets.sockets.get(game.player2SocketId)?.join(roomName);
    console.log('Sockets in room:', io.sockets.adapter.rooms.get(roomName)?.size);
  
    // Store the game data directly on the room object
    const room = socket.adapter.rooms.get(roomName);
    if (room) {
      room.game = game;
      console.log("Room:", room);
  
      // Emit the "gameStarted" to all users in the room
      io.to(roomName).emit('gameStarted', game);
      if (callback) {
        callback(game);
      }
    } else {
      console.error('Room not found:', roomName);
      if (callback) {
        callback({ error: 'Room not found' });
      }
    }
  });

  socket.on('fetchPlayingGames', (callback) => {
    if (!util.checkAuthenticatedUser(socket, callback)) {
      return
    }
    if (callback) {
      callback(util.getGamesPlaying(socket))
    }
  })

  socket.on('play', (playData, callback) => {
    if (!util.checkAuthenticatedUser(socket, callback)) {
      return
    }
    const roomName = 'game_' + playData.gameId
    // load game state from the game data stored directly on the room object: 
    const game = socket.adapter.rooms.get(roomName).game
    const playResult = gameEngine.play(game, playData.index, socket.id)
    if (playResult !== true) {
      if (callback) {
        callback(playResult)
      }
      return
    } 
    io.to(roomName).emit('gameChanged', game)
    if (gameEngine.gameEnded(game)) {
      io.to(roomName).emit('gameEnded', game)
    }
    if (callback) {
      callback(game)
    }
  })

  socket.on('quitGame', (gameId, callback) => {
    if (!util.checkAuthenticatedUser(socket, callback)) {
      return
    }
    const roomName = 'game_' + gameId
    // load game state from the game data stored directly on the room object: 
    const game = socket.adapter.rooms.get(roomName).game
    const quitResult = gameEngine.quit(game, socket.id)
    if (quitResult !== true) {
      if (callback) {
        callback(quitResult)
      }
      return
    }
    io.to(roomName).emit('gameChanged', game)
    io.to(roomName).emit('gameQuitted', { userQuit: socket.data.user, game: game })
    if (gameEngine.gameEnded(game)) {
      io.to(roomName).emit('gameEnded', game)
    }
    socket.leave(roomName)
    if (callback) {
      callback(game)
    }
  })

  socket.on('closeGame', (gameId, callback) => {
    if (!util.checkAuthenticatedUser(socket, callback)) {
      return
    }
    const roomName = 'game_' + gameId
    // load game state from the game data stored directly on the room object: 
    const game = socket.adapter.rooms.get(roomName).game
    const closeResult = gameEngine.close(game, socket.id)
    if (closeResult !== true) {
      if (callback) {
        callback(closeResult)
      }
      return
    }
    socket.leave(roomName)
    if (callback) {
      callback(true)
    }
  })



});