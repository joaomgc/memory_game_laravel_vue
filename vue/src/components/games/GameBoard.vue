<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth'
import { useGameBoardStore } from '@/stores/gameboard'
import { useToast } from '@/components/ui/toast/use-toast';
import { useCardDesignStore } from '@/stores/cardDesign';


const authStore = useAuthStore()
const gameboardStore = useGameBoardStore()
const route = useRoute();
const router = useRouter();
const { toast } = useToast();
const cardDesignStore = useCardDesignStore()

const mode = computed(() => route.params.mode);

const goToHomeBoard = () => {
  router.push({ name: 'home' });
};

// Restart game function
const restartGame = () => {
  gameboardStore.resetGame();
};

// Initialize the game when the component is mounted
const initGame = () => {
  gameboardStore.initializeGame(mode.value);
};

const errorMessage = computed(() => gameboardStore.errorMessage);

// Call initialization when component is created
initGame();

</script>

<template>
  <div class="flex flex-col items-center justify-center p-5">
    <h1 class="text-3xl font-bold mb-4">Game Mode: {{ mode }}</h1>
    <h2 class="mb-2">Timer: {{ gameboardStore.formattedTime }}</h2>
    <h2 class="mb-4">Number of turns: {{ gameboardStore.turnCount }} </h2>
    <h2 v-if="authStore.user" class="mb-2">Username: {{ authStore.userFirstLastName }} </h2>
    <button v-if="authStore.user" @click="gameboardStore.revealHint()" class="bg-blue-500 text-white px-4 py-2 rounded mr-2 mb-4">Hint</button>

    <!-- <div v-if="errorMessage" class="text-red-500 text-sm">
                {{ errorMessage }}
            </div> -->

    <div class="grid gap-2 w-full max-w-2xl p-4 rounded-lg bg-gray-100" :style="{
      gridTemplateRows: `repeat(${gameboardStore.gridConfig.rows}, 1fr)`,
      gridTemplateColumns: `repeat(${gameboardStore.gridConfig.cols}, 1fr)`
    }">
      <div v-for="card in gameboardStore.cards" :key="card.uniqueKey"
        class="card-container flex items-center justify-center aspect-square cursor-pointer">
        <div class="card" :class="{ 'is-flipped': card.isFlipped }" @click="gameboardStore.flipCard(card)">
          <div class="card-front">
            <img class="w-full h-full object-contain" :src="card.image" alt="Card Front" :class="{
              'opacity-50': gameboardStore.matchedCards.includes(card.id)
            }">
          </div>
          <div class="card-back">
            <img class="w-full h-full object-contain" :src="cardDesignStore.selectedCardBack" alt="Card Back">
          </div>
        </div>
      </div>
    </div>

    <!-- Win Modal -->
    <div v-if="gameboardStore.isGameWon" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white p-8 rounded-lg text-center shadow-xl">
        <h2 class="text-2xl font-bold mb-4">
          Congratulations {{ authStore.userFirstLastName }}!
        </h2>
        <p class="mb-2">You've won the game in {{ gameboardStore.formattedTime }}!</p>
        <p class="mb-4">Number of turns: {{ gameboardStore.turnCount }}</p>
        <button @click="restartGame" class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition mr-2">
          Play Again
        </button>
        <button @click="goToHomeBoard" class="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition">
          Back to Dashboard
        </button>
      </div>
    </div>
  </div>
</template>

<style>
.card-container {
  perspective: 1000px;
}

.card {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s;
}

.card.is-flipped {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
}

.card-front {
  transform: rotateY(180deg);
}

.card-back {
  transform: rotateY(0deg);
}
</style>