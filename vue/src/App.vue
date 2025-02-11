<script setup>
import { useTemplateRef, provide, ref, inject } from 'vue';
import Toaster from './components/ui/toast/Toaster.vue';
import { useAuthStore } from '@/stores/auth';
import GlobalAlertDialog from '@/components/common/GlobalAlertDialog.vue'
import GlobalInputDialog from './components/common/GlobalInputDialog.vue';
import router from './router';
import { useChatStore } from '@/stores/chat';
import { useCardDesignStore } from './stores/cardDesign';

const storeChat = useChatStore()
const socket = inject('socket')
const authStore = useAuthStore()
const isGameScoresDropdownOpen = ref(false)
const isHistoryDropdownOpen = ref(false)
const cardDesignStore = useCardDesignStore()

let userDestination = null 

socket.on('privateMessage', (messageObj) => { 
userDestination = messageObj.user    
inputDialog.value.open( 
handleMessageFromInputDialog, 
'Message from ' + messageObj.user.name, 
`This is a private message sent by ${messageObj?.user?.name}!`, 
'Reply Message', '', 
'Close', 'Reply', 
messageObj.message 
) 
})

const handleMessageFromInputDialog = (message) => { 
storeChat.sendPrivateMessageToUser(userDestination, message) 
} 


const alertDialog = useTemplateRef('alert-dialog')
provide('alertDialog', alertDialog)

const inputDialog = useTemplateRef('input-dialog')
provide('inputDialog', inputDialog)

const logoutConfirmed = () => {
  cardDesignStore.resetCardBack()
  authStore.logout()
  router.push('/')
}

const logout = () => {
  alertDialog.value.open(logoutConfirmed,
    'Logout confirmation?', 'Cancel', `Yes, I want to log out`,
    `Are you sure you want to log out? You can still access your account later with
your credentials.`)
}

const users = () => {
  router.push('/users')
}

const closeGameScoresDropdown = () => {
  isGameScoresDropdownOpen.value = false
}

const closeHistoryDropdown = () => {
  isHistoryDropdownOpen.value = false
}

const toggleGameScoresDropdown = () => {
  isGameScoresDropdownOpen.value = !isGameScoresDropdownOpen.value
  isHistoryDropdownOpen.value = false
}

const toggleHistoryDropdown = () => {
  isHistoryDropdownOpen.value = !isHistoryDropdownOpen.value
  isGameScoresDropdownOpen.value = false
}

</script>

<template>
  <Toaster />
  <GlobalAlertDialog ref="alert-dialog"></GlobalAlertDialog>
  <GlobalInputDialog ref="input-dialog"></GlobalInputDialog>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav class="flex items-center justify-between h-16">
          <div class="flex items-center space-x-8">
            <RouterLink v-if="!authStore.userAdmin" to="/"
              class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              active-class="text-blue-600 font-semibold">
              Home
            </RouterLink>
            <RouterLink to="/testers/websocket"
              class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              active-class="text-blue-600 font-semibold">
              WebSockets Tester
            </RouterLink>
            <RouterLink to="/multiplayer"
              class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              active-class="text-blue-600 font-semibold">
              Multiplayer
            </RouterLink>
            <RouterLink to="/statistics"
              class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              active-class="text-blue-600 font-semibold">
              Statistics
            </RouterLink>

            <div class="relative" @mouseenter="isGameScoresDropdownOpen = true" @mouseleave="closeGameScoresDropdown">
              <button @click="toggleGameScoresDropdown"
                class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                :class="{ 'text-blue-600': isGameScoresDropdownOpen }">
                Game Scores
              </button>

              <transition enter-active-class="transition ease-out duration-100" enter-from-class="opacity-0 scale-95"
                enter-to-class="opacity-100 scale-100" leave-active-class="transition ease-in duration-75"
                leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
                <div v-if="isGameScoresDropdownOpen"
                  class="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md border border-gray-200 z-10">
                  <RouterLink to="/scoreboard/global"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    @click="closeGameScoresDropdown">
                    Global Game Scores
                  </RouterLink>
                  <RouterLink v-if="authStore.userPlayer" :to="`/scoreboard/${authStore.userId}`"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    @click="closeGameScoresDropdown">
                    Personal Game Scores
                  </RouterLink>
                </div>
              </transition>
            </div>

            <div v-if="authStore.userLoggedIn" class="relative" @mouseenter="isHistoryDropdownOpen = true" @mouseleave="closeHistoryDropdown">
              <button @click="toggleHistoryDropdown"
                class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                :class="{ 'text-blue-600': isHistoryDropdownOpen }">
                History
              </button>

              <transition enter-active-class="transition ease-out duration-100" enter-from-class="opacity-0 scale-95"
                enter-to-class="opacity-100 scale-100" leave-active-class="transition ease-in duration-75"
                leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
                <div v-if="isHistoryDropdownOpen"
                  class="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md border border-gray-200 z-10">
                  <RouterLink to="/history/game"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    @click="closeHistoryDropdown">
                    Game History
                  </RouterLink>
                  <RouterLink to="/history/transaction"
                    class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    @click="closeHistoryDropdown">
                    Transaction History
                  </RouterLink>
                </div>
              </transition>
            </div>

          </div>
          <div class="flex items-center space-x-4">
            <button v-if="authStore.userAdmin" @click="users"
              class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              All Users
            </button>
            <div v-if="authStore.user" class="flex items-center space-x-2">

              <div v-if="authStore.userType !== 'A'" class="flex items-center space-x-2">
                <img src="@/assets/brain-coins-logo.png" alt="Brain Coins Logo" class="w-12 h-12">
                <span>{{ authStore.userBrainCoinsBalance }}</span>
                <RouterLink to="/purchaseBrainCoins"
                  class="text-gray-900 hover:text-blue-600 px-2 py-1 rounded-md text-sm font-medium transition-colors">
                  +
                </RouterLink>
              </div>
              <RouterLink :to="`/profile/${authStore.userId}`"
                class="flex items-center space-x-2 text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                active-class="text-blue-600 font-semibold">
                <img class="w-10 h-10 rounded-full" :src="authStore.userPhotoUrl" alt="User avatar">
                <span class="text-gray-900">{{ authStore.userFirstLastName }}</span>
              </RouterLink>
              <button v-if="authStore.user" @click="logout"
                class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Logout
              </button>
            </div>
            <RouterLink v-else to="/login"
              class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              active-class="text-blue-600 font-semibold">
              Login
            </RouterLink>
            <RouterLink v-if="!authStore.user" to="/register"
              class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              active-class="text-blue-600 font-semibold">
              Register
            </RouterLink>
          </div>
        </nav>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <RouterView />
    </main>
  </div>
</template>