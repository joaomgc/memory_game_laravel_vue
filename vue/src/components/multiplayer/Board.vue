<script setup>
import Card from './Card.vue'
import { computed } from 'vue';

const props = defineProps({
  board: {
    type: Array,
    required: true
  },
  size: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['play'])

const playPieceOfBoard = (idx) => {
  emit('play', idx)
}

const gridClasses = computed(() => {
  const columnMap = {
    12: 'grid-cols-3',
    16: 'grid-cols-4',
    36: 'grid-cols-6'
  }
  return columnMap[props.size] || 'grid-cols-3' // Default fallback
})
</script>

<template>
  <div :class="['grid', gridClasses, 'gap-4']">
    <Card
      v-for="(card, idx) in board"
      :key="idx"
      :piece="card.value"
      :index="idx"
      :is-flipped="card.isFlipped"
      :is-matched="card.isMatched"
      @flip="playPieceOfBoard(idx)"
    />
  </div>
</template>

<style scoped>
.grid {
  display: grid;
}
</style>