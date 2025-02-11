<script setup>
const props = defineProps({
    successMessage: {
        type: String,
        default: ''
    }
})
</script>

<template>
    <div class="text-green-500 text-sm" v-show="successMessage">
        {{ successMessage }}
    </div>
</template>