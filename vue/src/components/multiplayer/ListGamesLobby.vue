<script setup>
import { useAuthStore } from '@/stores/auth'
import { useLobbyStore } from '@/stores/lobby';
import { onMounted } from 'vue'

const storeAuth = useAuthStore()
const storeLobby = useLobbyStore()

onMounted(() => {
    storeAuth.restoreToken();
    storeLobby.fetchGames()
})

</script>

<template>
    <div class="divide-y divide-gray-200">
        <div v-if="storeAuth.userType === 'A'">
            <h2 class="text-xl">Admins do not have access to the lobby!</h2>
        </div>
        <div v-else>
      <div v-for="game in storeLobby.games" :key="game.id" class="py-4">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-sm font-medium text-gray-900">
              Created by: {{ game.player1.name }}
            </p>
            <p class="text-sm text-gray-500">
              Created at: {{ new Date(game.created_at).toLocaleString() }}
            </p>
          </div>
          <div>
            <button 
              @click="storeLobby.joinGame(game.id)"
              class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Join Game
            </button>
          </div>
        </div>
      </div>      
      </div>
    </div>
  </template>