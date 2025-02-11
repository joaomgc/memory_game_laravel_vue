<script setup>
import { useScoreBoardStore } from '@/stores/scoreboard';
import { computed, ref, onMounted } from 'vue';

const scoreboardStore = useScoreBoardStore();

const fetchScores = async (cols, rows) => {
    await scoreboardStore.fetchSinglePlayerBestTimes(cols, rows);
    await scoreboardStore.fetchSinglePlayerMinTurns(cols, rows);
    await scoreboardStore.fetchTopMultiplayerVictories();
    selectedDimension.value = `${cols}x${rows}`;
};


const singlePlayerBestTimes = computed(() => scoreboardStore.singlePlayerBestTimes);
const singlePlayerMinTurns = computed(() => scoreboardStore.singlePlayerMinTurns);
const topMultiplayerVictories = computed(() => scoreboardStore.topMultiplayerVictories);
const selectedDimension = ref('3x4');

onMounted(() => {
    fetchScores(3, 4);
});
</script>
<template>
    <div class="max-w-4xl mx-auto py-12">
        <h1 class="text-3xl font-bold mb-8 text-center">Global Scores</h1>

        <div class="text-center mb-8">
            <h2 class="text-xl font-bold mb-8 text-center"> Choose a board dimension </h2>
            <button @click="fetchScores(3, 4)" :class="{
                'bg-blue-700 text-white': selectedDimension === '3x4',
                'bg-blue-500 text-white': selectedDimension !== '3x4',
                }"
                class="px-4 py-2 rounded mr-2">
                3x4</button>
            <button @click="fetchScores(4, 4)" :class="{
                'bg-blue-700 text-white': selectedDimension === '4x4',
                'bg-blue-500 text-white': selectedDimension !== '4x4',
                }" class="bg-blue-500 text-white px-4 py-2 rounded mr-2">
                4x4</button>
            <button @click="fetchScores(6, 6)" :class="{
                'bg-blue-700 text-white': selectedDimension === '6x6',
                'bg-blue-500 text-white': selectedDimension !== '6x6',
                }" class="bg-blue-500 text-white px-4 py-2 rounded">
                6x6</button>
        </div>

        <div v-if="singlePlayerBestTimes.length > 0" class="bg-white w-full mb-8">
            <h3 class="text-2xl font-bold mb-4 text-center">Single Player Best Times</h3>
            <table class="min-w-full bg-white border border-gray-300">
                <thead>
                    <tr>
                        <th class="py-2 border-b">Nickname</th>
                        <th class="py-2 border-b">Time</th>
                        <th class="py-2 border-b">Board Size</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="time in singlePlayerBestTimes" :key="time.nickname">
                        <td class="py-2 border-b text-center">{{ time.nickname }}</td>
                        <td class="py-2 border-b text-center">{{ time.total_time }}</td>
                        <td class="py-2 border-b text-center">{{ time.board_cols }}x{{ time.board_rows }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-if="singlePlayerMinTurns.length > 0" class="bg-white w-full mb-8">
            <h3 class="text-2xl font-bold mb-4 text-center">Single Player Min Turns</h3>
            <table class="min-w-full bg-white border border-gray-300">
                <thead>
                    <tr>
                        <th class="py-2 border-b">Nickname</th>
                        <th class="py-2 border-b">Turns</th>
                        <th class="py-2 border-b">Board Size</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="turn in singlePlayerMinTurns" :key="turn.nickname">
                        <td class="py-2 border-b text-center">{{ turn.nickname }}</td>
                        <td class="py-2 border-b text-center">{{ turn.total_turns_winner }}</td>
                        <td class="py-2 border-b text-center">{{ turn.board_cols }}x{{ turn.board_rows }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-if="topMultiplayerVictories.length > 0" class="bg-white w-full mb-8">
            <h3 class="text-2xl font-bold mb-4 text-center">Top Multiplayer Victories</h3>
            <table class="min-w-full bg-white border border-gray-300">
                <thead>
                    <tr>
                        <th class="py-2 border-b">Nickname</th>
                        <th class="py-2 border-b">Victories</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="player in topMultiplayerVictories" :key="player.nickname">
                        <td class="py-2 border-b text-center">{{ player.nickname }}</td>
                        <td class="py-2 border-b text-center">{{ player.total_victories }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-else class="text-center py-8 text-gray-500">
            <p>No scores found.</p>
        </div>
    </div>
</template>