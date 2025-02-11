<script setup>
import { useScoreBoardStore } from '@/stores/scoreboard';
import { useAuthStore } from '@/stores/auth';
import { computed, onMounted } from 'vue';

const scoreboardStore = useScoreBoardStore();
const authStore = useAuthStore();

const fetchUserStats = async (userId, cols, rows) => {
    await scoreboardStore.fetchUsersStats(userId, cols, rows);
};

const userBestTimes = computed(() => scoreboardStore.usersStats?.best_times || []);
const userMinTurns = computed(() => scoreboardStore.usersStats?.min_turns || []);
const userVictories = computed(() => scoreboardStore.usersStats?.victories || 0);
const userLosses = computed(() => scoreboardStore.usersStats?.losses || 0);
const userWinRate = computed(() => scoreboardStore.usersStats?.win_rate || '0');

onMounted(() => {
    if (authStore.userId) {
        fetchUserStats(authStore.userId, 3, 4); // Default board size
    }
});
</script>

<template>
    <div class="max-w-4xl mx-auto py-12">
        <h1 class="text-3xl font-bold mb-8 text-center">User Scoreboard</h1>

        <div class="text-center mb-8">
            <h2 class="text-xl font-bold mb-8 text-center">Choose a board dimension</h2>
            <button @click="fetchUserStats(authStore.userId, 3, 4)"
                class="bg-blue-500 text-white px-4 py-2 rounded mr-2">
                3x4</button>
            <button @click="fetchUserStats(authStore.userId, 4, 4)"
                class="bg-blue-500 text-white px-4 py-2 rounded mr-2">
                4x4</button>
            <button @click="fetchUserStats(authStore.userId, 6, 6)" class="bg-blue-500 text-white px-4 py-2 rounded">
                6x6</button>
        </div>

        <div v-if="userBestTimes.length > 0" class="bg-white w-full mb-8">
            <h3 class="text-2xl font-bold mb-4 text-center">User Best Times</h3>
            <table class="min-w-full bg-white border border-gray-300">
                <thead>
                    <tr>
                        <th class="py-2 border-b">Time</th>
                        <th class="py-2 border-b">Board Size</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="time in userBestTimes" :key="time.total_time">
                        <td class="py-2 border-b text-center">{{ time.total_time }}</td>
                        <td class="py-2 border-b text-center">{{ time.board_cols }}x{{ time.board_rows }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-if="userMinTurns.length > 0" class="bg-white w-full mb-8">
            <h3 class="text-2xl font-bold mb-4 text-center">User Min Turns</h3>
            <table class="min-w-full bg-white border border-gray-300">
                <thead>
                    <tr>
                        <th class="py-2 border-b">Turns</th>
                        <th class="py-2 border-b">Board Size</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="turn in userMinTurns" :key="turn.total_turns_winner">
                        <td class="py-2 border-b text-center">{{ turn.total_turns_winner }}</td>
                        <td class="py-2 border-b text-center">{{ turn.board_cols }}x{{ turn.board_rows }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-if="scoreboardStore.usersStats" class="bg-white w-full mb-8">
            <h3 class="text-2xl font-bold mb-4 text-center">User Statistics</h3>
            <table class="min-w-full bg-white border border-gray-300">
                <thead>
                    <tr>
                        <th class="py-2 border-b">Victories</th>
                        <th class="py-2 border-b">Losses</th>
                        <th class="py-2 border-b">Win Rate</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="py-2 border-b text-center">{{ userVictories }}</td>
                        <td class="py-2 border-b text-center">{{ userLosses }}</td>
                        <td class="py-2 border-b text-center">{{ userWinRate }}%</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-else class="text-center py-8 text-gray-500">
            <p>No scores found.</p>
        </div>
    </div>
</template>