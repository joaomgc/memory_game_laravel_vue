<script setup>
import { inject, ref, watch, onMounted, onUnmounted } from 'vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { computed } from 'vue'
import Board from './Board.vue'
import { useAuthStore } from '@/stores/auth'
import { useMultiplayerStore } from '@/stores/multiplayer'

const storeMultiGames = useMultiplayerStore()
const storeAuth = useAuthStore()
const autoStart = ref(false)
const seconds = ref(0)
let timer = null
const hasStarted = ref(false)  // Add this to track first card flip

const startTimer = () => {
  if (!hasStarted.value) {
    hasStarted.value = true
    timer = setInterval(() => {
      seconds.value++
    }, 1000)
  }
}

const resetTimer = () => {
  clearInterval(timer)
  seconds.value = 0
  hasStarted.value = false  // Reset hasStarted
}

const pauseTimer = () => {
  clearInterval(timer)
}

const showSeconds = computed(() => {
  return 20 - seconds.value
})

const interrupt = computed(() => {
  return seconds.value >= 20
})

const props = defineProps({
  game: {
    type: Object,
    required: true
  }
})

onMounted(() => {
  console.log('Game', props.game)
})

const alertDialog = inject('alertDialog')

const opponentName = computed(() => {
  const gameData = props.game.data?.data
  return storeMultiGames.playerNumberOfCurrentUser(gameData) === 1
    ? storeAuth.getFirstLastName(props.game.player2?.name)
    : storeAuth.getFirstLastName(props.game.player1?.name)
})

const wow = computed(() => {
  return props.game.flippedCards.length == 2
})

const gameEnded = computed(() => {
  return props.game.gameStatus > 0
})

const currentUserTurn = computed(() => {
  if (gameEnded.value) {
    return false
  }
  if (props.game.currentPlayer === storeMultiGames.playerNumberOfCurrentUser(props.game.currentPlayer)){
    startTimer()
    return true
  }
  resetTimer()
  pauseTimer()
  return false
})

const turns = computed(() => {
  return props.game.turns[storeMultiGames.playerNumberOfCurrentUser(props.game)]
})

const cardBgColor = computed(() => {
  switch (props.game.gameStatus) {
    case 0:
      return 'bg-white'
    case 1:
    case 2:
      return storeMultiGames.playerNumberOfCurrentUser(props.game) == props.game.gameStatus
        ? 'bg-green-100'
        : 'bg-red-100'
    case 3:
      return 'bg-blue-100'
    default:
      return 'bg-slate-100'
  }
})

const statusMessageColor = computed(() => {
  switch (props.game.gameStatus) {
    case 0:
      return currentUserTurn.value ? 'text-green-400' : 'text-slate-400'
    case 1:
    case 2:
      return storeMultiGames.playerNumberOfCurrentUser(props.game) == props.game.gameStatus
        ? 'text-green-900'
        : 'text-red-900'
    case 3:
      return 'text-blue-900'
    default:
      return 'text-slate-800'
  }
})

const buttonClasses = computed(() => {
  if (gameEnded.value) {
    return 'bg-gray-700 text-gray-200 hover:text-gray-50'
  }
  return 'bg-gray-300 text-gray-700 hover:text-gray-200'
})

const statusGameMessage = computed(() => {
  switch (props.game.gameStatus) {
    case 0:
      if (props.game.currentPlayer == 1) {
        return props.game.player1.nickname + "'s Turn!"
      } else {
        return props.game.player2.nickname + "'s Turn!"
      }

    case 1:
    case 2:
      return storeMultiGames.playerNumberOfCurrentUser(props.game) == props.game.gameStatus
        ? 'You won'
        : 'You lost'
    case 3:
      return 'Draw' // Doesnt exist 
    default:
      return 'Not started!'
  }
})

const playPieceOfBoard = (idx) => {
  if (!gameEnded.value && currentUserTurn.value && !wow.value) {
    if (!hasStarted.value) {
      startTimer()  // Start timer on first card flip
    }
    storeMultiGames.play(props.game, idx)
    if (interrupt.value) {
      resetTimer()
    }
  }
}

const clickCardButton = () => {
  if (gameEnded.value) {
    close()
  } else {
    alertDialog.value.open(
      quit,
      'Quit game',
      'Cancel',
      `Yes, I want to quit`,
      `Are you sure you want to quit the game #${props.game.id}? You'll lose the game!`
    )
  }
}

watch(interrupt, (newValue) => {
  if (newValue === true) {
    storeMultiGames.quit(props.game)
  }
})

const close = () => {
  storeMultiGames.close(props.game)
}
const quit = () => {
  storeMultiGames.quit(props.game)
}

onMounted(() => {
  console.log('Game', props.game)
  // if (autoStart.value) {
  //   startTimer()
  // }
})

onUnmounted(() => {
  pauseTimer()
})
</script>

<template>
  <!-- <Card class="mx-auto my-8 p-2 px-4 min-w-[20rem] max-w-[25rem]"> -->
  <Card class="relative grow mx-4 mt-8 pt-2 pb-4 px-1" :class="cardBgColor">
    <CardHeader class="pb-0">
      <p class="text-lg sm:text-xl text-gray-800 dark:text-gray-300">
        ⏱ Time:
        <span class="font-semibold text-black dark:text-white">{{ showSeconds }}</span>
      </p>
      <p class="text-lg sm:text-xl text-gray-800 dark:text-gray-300">
        📋 Moves: <span class="font-semibold text-black dark:text-white">{{ turns }}</span>
      </p>
      <Button @click="clickCardButton" class="absolute top-4 right-4" :class="buttonClasses">
        <!-- class="absolute -mt-8 -mr-20" :class="buttonClasses"> -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
        {{ gameEnded ? 'Close' : 'Quit' }}
      </Button>
      <CardTitle>#{{ game.data.data.id }}</CardTitle>
      <CardDescription>
        <div class="text-base">
          <span class="font-bold">Opponent:</span> {{ opponentName }}
          {{ game.status == 'I' ? ' / Interrupted' : '' }}
        </div>
      </CardDescription>
    </CardHeader>
    <CardContent class="py-4 px-8">
      <h3 class="pt-0 text-2xl font-bold py-2" :class="statusMessageColor">
        {{ statusGameMessage }}
      </h3>
      <div>
        <Board 
  :board="game.board" 
  :size="game.size" 
  @play="playPieceOfBoard" 
  @firstCardFlipped="startGameTimer"
/>
      </div>
    </CardContent>
  </Card>
</template>