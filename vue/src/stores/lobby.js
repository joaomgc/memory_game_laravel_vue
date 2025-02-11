import { ref, computed, inject } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useErrorStore } from '@/stores/error'
import { useAuthStore } from '@/stores/auth'


export const useLobbyStore = defineStore('lobby', () => {
    const storeAuth = useAuthStore()
    const storeError = useErrorStore()
    const socket = inject('socket')

    const games = ref([])
    const gameId = ref(null)

    const totalGames = computed(() => games.value.length)

    const webSocketServerResponseHasError = (response) => {
        if (response.errorCode) {
            storeError.setErrorMessages(response.errorMessage, [], response.errorCode)
            return true
        }
        return false
    }

    // when the lobby changes on the server, it is updated on the client
    socket.on('lobbyChanged', (lobbyGames) => {
        games.value = lobbyGames
    })

    // fetch lobby games from the Websocket server
    const fetchGames = () => {
        storeError.resetMessages()
        socket.emit('fetchGames', (response) => {
            if (webSocketServerResponseHasError(response)) {
                return
            }
            games.value = response
        })
    }

    // add a game to the lobby
    const addGame = async (boardId) => {

        try {

            storeError.resetMessages()


            const gameData = {
                type: 'M',
                created_user_id: storeAuth.userId,
                status: 'PE',
                board_id: boardId,
                began_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
            }

            const response = await axios.post('games', gameData)
            console.log('Game created:', response.data.data.id)
            const dbGameId = response.data.data.id


            socket.emit('addGame', dbGameId, (response) => {
                if (webSocketServerResponseHasError(response)) {
                    return
                }
                gameId.value = dbGameId
            })

        } catch (error) {
            console.error('Failed to create game:', error)

            storeError.setErrorMessages(
                error.response?.data?.message || 'Failed to create game',
                error.response?.data?.errors || {},
                error.response?.status || 500
            )
        }

    }



    // remove a game from the lobby
    const removeGame = (id) => {
        storeError.resetMessages()
        socket.emit('removeGame', id, (response) => {
            if (webSocketServerResponseHasError(response)) {
                return
            }
        })
    }

    // join a game of the lobby
    const joinGame = (id) => {
        storeError.resetMessages()
        console.log('Joining game:', id)

        // Ensure we pass the raw ID value, not a ref
        socket.emit('joinGame', Number(id), async (response) => {
            if (webSocketServerResponseHasError(response)) {
                return
            }

            const APIresponse = await axios.put(`games/${id}`, { status: 'PL' })
            const updatedGame = APIresponse.data.data
            console.log("ResponseLobby: ", response)
            const dataToSend = {
                user_id: response.player2.id,
                game_id: updatedGame.id
            }
            console.log("AQUI PA:", dataToSend)
            const multiplayerGame = await axios.post('games/multiplayer', dataToSend)
            multiplayerGame.player1SocketId = response.player1SocketId;
            multiplayerGame.player2SocketId = response.player2SocketId;
            multiplayerGame.player1 = response.player1;
            multiplayerGame.player2 = response.player2;

            console.log('Game joined:', id)
            console.log("Response to put: ", updatedGame)
            console.log("Created Multiplayer game: ", multiplayerGame)

            socket.emit('startGame', multiplayerGame, (startedGame) => {
                console.log('Game has started', startedGame)
            })
        })
    }

    // Whether the current user can remove a specific game from the lobby
    const canRemoveGame = (game) => {
        return game.player1.id === storeAuth.userId
    }

    // Whether the current user can join a specific game from the lobby
    const canJoinGame = (game) => {
        return storeAuth.user && game.player1.id !== storeAuth.userId
    }

    return {
        games, totalGames, fetchGames, addGame, joinGame, canJoinGame, removeGame, canRemoveGame
    }
})
