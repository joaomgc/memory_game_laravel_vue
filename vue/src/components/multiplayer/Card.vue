<script setup>
const props = defineProps(['piece', 'index', 'isFlipped', 'isMatched']);
const emit = defineEmits(['flip']);

const flipCard = () => {
  if (!props.isFlipped && !props.isMatched) {
    emit('flip', props.index);
  }
}
</script>

<template>
  <div class="card" @click="flipCard">
    <div
      :class="[
        'card-inner',
        { 'is-flipped': props.isFlipped || props.isMatched }
      ]"
    >
      <!-- Front of the card -->
      <div class="card-front">
        <div class="card-content">{{ props.piece }}</div>
      </div>

      <!-- Back of the card -->
      <div class="card-back">
        <div class="card-content">?</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  perspective: 1000px;
  width: 100px;
  height: 150px;
  cursor: pointer;
}

.card-inner {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s ease-in-out;
}

.card-inner.is-flipped {
  transform: rotateY(180deg);
}

.card-front,
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
}

.card-front {
  background-color: #4caf50; /* Customize front face color */
  transform: rotateY(180deg);
}

.card-back {
  background-color: #f44336; /* Customize back face color */
}
</style>