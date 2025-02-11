<script setup>
import { ref, onMounted } from 'vue'
import { useCardDesignStore } from '@/stores/cardDesign';

const cardDesignStore = useCardDesignStore()

const cardDesigns = ref([
    { id: 1, name: 'Design 1', image: '/card_back.png', current: true },
    { id: 2, name: 'Design 2', image: '/card_back2.png', current: false },
    { id: 3, name: 'Design 3', image: '/card_back3.png', current: false },
    { id: 4, name: 'Design 4', image: '/card_back4.png', current: false },
    { id: 5, name: 'Design 5', image: '/card_back5.png', current: false },
    { id: 6, name: 'Design 6', image: '/card_back6.png', current: false },
    { id: 7, name: 'Design 7', image: '/card_back7.png', current: false },
    { id: 8, name: 'Design 8', image: '/card_back8.png', current: false }
])

const selectDesign = (design) => {
    cardDesigns.value.forEach(d => d.current = false)
    design.current = true
    cardDesignStore.setCardBack(design.image)
}

onMounted(() => {
    const storedDesign = cardDesigns.value.find(design => design.image === cardDesignStore.selectedCardBack)
  if (storedDesign) {
    selectDesign(storedDesign)
  }
})

</script>

<template>
    <div class="max-w-7xl mx-auto py-12 px-4">
        <h1 class="text-3xl font-bold mb-8 text-center">Card Back Designs</h1>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div v-for="design in cardDesigns" :key="design.id"
                class="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
                <img :src="design.image" :alt="design.name" class="w-40 h-40 object-contain mb-4">
                <h3 class="text-lg font-semibold mb-2">{{ design.name }}</h3>
                <span class="text-sm mb-4" :class="design.current ? 'text-green-600' : 'text-gray-500'">
                    {{ design.current ? 'Currently Using' : 'Available' }}
                </span>
                <button @click="selectDesign(design)"
                    class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    :disabled="design.current" :class="{ 'opacity-50 cursor-not-allowed': design.current }">
                    {{ design.current ? 'Selected' : 'Select' }}
                </button>
            </div>
        </div>
    </div>
</template>