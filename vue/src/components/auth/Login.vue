<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import { Button } from '@/components/ui/button'
import { useErrorStore } from '@/stores/error';
import ErrorMessage from '@/components/common/ErrorMessage.vue'

const authStore = useAuthStore()
const errorStore = useErrorStore()
const router = useRouter()

const credentials = ref({
    email: '',
    nickname: '',
    name: '',
    photo: null,
    password: ''
})

const errorMessage = ref('')
const successMessage = ref('')

const login = async () => {
    // Clear previous error messages
    errorMessage.value = ''
    
    // Validate email and password
    if (!credentials.value.email || !credentials.value.password) {
        errorMessage.value = 'Please provide both email and password'
        return
    }

    try {
        const result = await authStore.login(credentials.value)
        
        // Only navigate to root if login is successful
        if (result) {
            router.push('/')
        }
    } catch (error) {
        // Handle any login errors
        errorMessage.value = error.message || 'Login failed'
    }
}
</script>

<template>
    <div class="max-w-2xl mx-auto py-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Login</h2>

        <form @submit.prevent="login" class="space-y-6">
            <div class="space-y-2">
                <label for="email" class="block text-sm font-medium text-gray-700">
                    Email:
                </label>
                <input type="text" id="email" v-model="credentials.email"
                    class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <ErrorMessage :errorMessage="errorStore.fieldMessage('email')"></ErrorMessage>
            </div>

            <div class="space-y-2">
                <label for="password" class="block text-sm font-medium text-gray-700">
                    Password:
                </label>
                <input type="password" id="password" v-model="credentials.password"
                    class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <ErrorMessage :errorMessage="errorStore.fieldMessage('password')"></ErrorMessage>
            </div>

            <div v-if="errorMessage" class="text-red-500 text-sm">
                {{ errorMessage }}
            </div>

            <div v-if="successMessage" class="text-green-500 text-sm">
                {{ successMessage }}
            </div>

            <Button type="submit">Login</Button>
        </form>
    </div>
</template>