import { ref } from 'vue';
import { defineStore } from 'pinia';
import axios from 'axios';

export const useScoreBoardStore = defineStore('scoreboard', () => {
    const singlePlayerBestTimes = ref([]);
    const singlePlayerMinTurns = ref([]);
    const topMultiplayerVictories = ref([]);
    const usersStats = ref(null);

    const fetchSinglePlayerBestTimes = async (cols, rows) => {
        try {
            const response = await axios.get(`/scoreboard/single-player-best-times/${cols}/${rows}`);
            singlePlayerBestTimes.value = response.data;
        } catch (error) {
            console.error('Error fetching single player best times:', error);
            singlePlayerBestTimes.value = [];
        }
    };

    const fetchSinglePlayerMinTurns = async (cols, rows) => {
        try {
            const response = await axios.get(`/scoreboard/single-player-min-turns/${cols}/${rows}`);
            singlePlayerMinTurns.value = response.data;
        } catch (error) {
            console.error('Error fetching single player minimum turns:', error);
            singlePlayerMinTurns.value = [];
        }
    };

    const fetchTopMultiplayerVictories = async () => {
        try {
            const response = await axios.get('/scoreboard/top-multiplayer-victories');
            topMultiplayerVictories.value = response.data;
        } catch (error) {
            console.error('Error fetching top multiplayer victories:', error);
            topMultiplayerVictories.value = [];
        }
    };

    const fetchUsersStats = async (userId, cols, rows) => {
        try {
            const response = await axios.get(`/scoreboard/users-stats/${userId}/${cols}/${rows}`);
            usersStats.value = response.data;
        } catch (error) {
            console.error('Error fetching users stats:', error);
            usersStats.value = null;
        }
    };

    return {
        singlePlayerBestTimes,
        singlePlayerMinTurns,
        topMultiplayerVictories,
        usersStats,
        fetchSinglePlayerBestTimes,
        fetchSinglePlayerMinTurns,
        fetchTopMultiplayerVictories,
        fetchUsersStats,
    };
});