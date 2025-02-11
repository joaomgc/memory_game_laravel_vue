import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useErrorStore } from '@/stores/error'

export const useGameStore = defineStore('game', () => {
    const storeError = useErrorStore()
    const gameHistory = ref([])
    const games = ref([])

    const fetchGameHistory = async () => {
        const response = await axios.get('games/history')
        gameHistory.value = response.data.data // Adjusted to access the data property
    }

    const getGames = async () => {
        try {
            const response = await axios.get('games')
            games.value = response.data.data // Storing the list of games
        } catch (error) {
            console.error('Failed to fetch games:', error)
            storeError.setErrorMessages(
                error.response.data.message,
                error.response.data.errors,
                error.response.status,
                'Failed to fetch games'
            )
        }
    }

    const createGame = async (gameData) => {
        try {
            const response = await axios.post('games', gameData)
            return response.data
        } catch (error) {
            console.error('Failed to create game:', error)
            storeError.setErrorMessages(
                error.response.data.message,
                error.response.data.errors,
                error.response.status,
                'Failed to create game'
            )
        }
    }

    const updateGame = async (gameId, updatedData) => {
        try {
            const response = await axios.put(`games/${gameId}`, updatedData)
            // Update the local game state
            const index = games.value.findIndex(game => game.id === gameId)
            if (index !== -1) {
                games.value[index] = response.data.data
            }
            return response.data
        } catch (error) {
            console.error('Failed to update game:', error)
            storeError.setErrorMessages(
                error.response.data.message,
                error.response.data.errors,
                error.response.status,
                'Failed to update game'
            )
        }
    }

    const deleteGame = async (gameId) => {
        try {
            await axios.delete(`games/${gameId}`)
            // Remove the game from the list after deletion
            games.value = games.value.filter(game => game.id !== gameId)
        } catch (error) {
            console.error('Failed to delete game:', error)
            storeError.setErrorMessages(
                error.response.data.message,
                error.response.data.errors,
                error.response.status,
                'Failed to delete game'
            )
        }
    }

    return {
        gameHistory,
        games,
        fetchGameHistory,
        getGames,
        createGame,
        updateGame,
        deleteGame
    }
})