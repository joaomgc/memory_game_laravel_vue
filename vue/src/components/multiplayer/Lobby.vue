<script setup>
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button';
import { ref, onMounted } from 'vue'
import ListGamesLobby from './ListGamesLobby.vue'
import { useLobbyStore } from '@/stores/lobby'
import { useAuthStore } from '@/stores/auth'

const storeAuth = useAuthStore()
const storeLobby = useLobbyStore()
const selectedBoardId = ref()

const createGame = () => {
    storeLobby.addGame(selectedBoardId.value)
}


onMounted(() => {
    storeAuth.restoreToken();
    storeLobby.fetchGames()
})

</script>

<template>
    <Card class="my-8 py-2 px-1">
        <CardHeader class="pb-0">
            <CardTitle>Lobby</CardTitle>
            <CardDescription>{{ storeLobby.totalGames == 1 ? '1 game' : storeLobby.totalGames + ' games' }} waiting.
            </CardDescription>
        </CardHeader>
        <CardContent class="p-4">
            <div class="py-2 space-y-4">
                <div class="flex items-center space-x-4">
                    <div class="flex items-center">
                        <input type="radio" id="board4x4" value="2" v-model="selectedBoardId"
                            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500">
                        <label for="board4x4" class="ml-2 text-sm font-medium text-gray-900">4x4</label>
                    </div>
                    <div class="flex items-center">
                        <input type="radio" id="board6x6" value="3" v-model="selectedBoardId"
                            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500">
                        <label for="board6x6" class="ml-2 text-sm font-medium text-gray-900">6x6</label>
                    </div>
                </div>
            </div>
            <Button class="py-2" @click="createGame">
                New Game
            </Button>
            <div v-if="storeLobby.totalGames > 0">
                <ListGamesLobby></ListGamesLobby>
            </div>
            <div v-else>
                <h2 class="text-xl">The lobby is empty!</h2>
            </div>
        </CardContent>
    </Card>
</template>