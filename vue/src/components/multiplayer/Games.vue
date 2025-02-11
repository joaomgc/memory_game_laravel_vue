<script setup>
import { onMounted } from 'vue'
import Game from './Game.vue'
import { useMultiplayerStore } from '@/stores/multiplayer';

const storeMultiplayer = useMultiplayerStore()

onMounted(() => {
    storeMultiplayer.fetchPlayingGames()
})
</script>

<template>
    <div class="flex flex-wrap justify-stretch">
        <Game v-for="game in storeMultiplayer.games" :key="game.id" :game="game">
            
        </Game>
    </div>
</template>