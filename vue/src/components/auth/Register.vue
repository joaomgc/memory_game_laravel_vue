<script setup>
import { useTemplateRef, ref, computed, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/ui/button'
import { useErrorStore } from '@/stores/error';
import ErrorMessage from '@/components/common/ErrorMessage.vue'
import { useRouter } from 'vue-router'
import { toast } from '../ui/toast';
import axios from 'axios'

const authStore = useAuthStore()
const errorStore = useErrorStore()
const router = useRouter()
// const toast = useTemplateRef('toaster')

const errorMessage = ref('')
const successMessage = ref('')

const credentials = reactive({
  email: '',
  nickname: '',
  name: '',
  photo: null,
  password: '',
  password_confirmation: ''
})

const register = async () => {


  errorMessage.value = ''
  successMessage.value = ''

  let isValid = true
  if (!credentials.email) {
    isValid = false
    errorStore.setErrors({ email: ['Email is required.'] })
  }
  if (!credentials.nickname) {
    isValid = false
    errorStore.setErrors({ nickname: ['Nickname is required.'] })
  }
  if (!credentials.name) {
    isValid = false
    errorStore.setErrors({ name: ['Name is required.'] })
  }
  if (!credentials.password) {
    isValid = false
    errorStore.setErrors({ password: ['Password is required.'] })
  }
  if (!credentials.password_confirmation) {
    isValid = false
    errorStore.setErrors({ password_confirmation: ['Confirm password is required.'] })
  }

  if (isValid) {
    // Create FormData for file upload
    const formData = new FormData()
    for (const key in credentials) {
      if (credentials[key] !== null) {
        formData.append(key, credentials[key])
      }
    }

    try {
      let result = null
      if (authStore.userAdmin) {
        result = await authStore.registerAdmin(formData)
      } else {
        result = await authStore.register(formData)
      }
      if (result) {
        console.log("User created:", authStore.user)
        console.log("Result: ", result)

        credentials.email = ''
        credentials.nickname = ''
        credentials.name = ''
        credentials.photo = null
        credentials.password = ''
        credentials.password_confirmation = ''

        successMessage.value = 'Account created successfully!'

        router.push('/')
        toast({
          description: 'Account created successfully!',
        })
      }

    } catch (error) {
      // Handle registration error
      errorMessage.value = 'Registration failed. Please check your details.'
      console.error(error)
    }
  }
}

</script>


<template>
  <div class="max-w-md mx-auto">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">{{ authStore.userAdmin ? 'Create an Admin' : 'Register a new account' }}</h2>

    <form @submit.prevent="register">
      <div class="space-y-2">
        <label for="email" class="block text-sm font-medium text-gray-700">
          Email:
        </label>
        <input type="email" id="email" v-model="credentials.email"
          :class="{ 'border-red-500': errorStore.fieldMessage('email') }"
          class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
        <ErrorMessage :errorMessage="errorStore.fieldMessage('email')"></ErrorMessage>
      </div>

      <div class="space-y-2">
        <label for="nickname" class="block text-sm font-medium text-gray-700">
          Nickname:
        </label>
        <input type="text" id="nickname" v-model="credentials.nickname"
          :class="{ 'border-red-500': errorStore.fieldMessage('nickname') }"
          class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
        <ErrorMessage :errorMessage="errorStore.fieldMessage('nickname')"></ErrorMessage>
      </div>

      <div class="space-y-2">
        <label for="name" class="block text-sm font-medium text-gray-700">
          Name:
        </label>
        <input type="text" id="name" v-model="credentials.name"
          :class="{ 'border-red-500': errorStore.fieldMessage('name') }"
          class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
        <ErrorMessage :errorMessage="errorStore.fieldMessage('name')"></ErrorMessage>
      </div>

      <div class="space-y-2">
        <label for="photo" class="block text-sm font-medium text-gray-700">
          Photo:
        </label>
        <input type="file" id="photo" @change="e => credentials.photo = e.target.files[0]"
          class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
        <ErrorMessage :errorMessage="errorStore.fieldMessage('photo')"></ErrorMessage>
      </div>

      <div class="space-y-2">
        <label for="password" class="block text-sm font-medium text-gray-700">
          Password:
        </label>
        <input type="password" id="password" v-model="credentials.password"
          :class="{ 'border-red-500': errorStore.fieldMessage('password') }"
          class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
        <ErrorMessage :errorMessage="errorStore.fieldMessage('password')"></ErrorMessage>
      </div>

      <div class="space-y-2">
        <label for="password_confirmation" class="block text-sm font-medium text-gray-700">
          Confirm Password:
        </label>
        <input type="password" id="password_confirmation" v-model="credentials.password_confirmation"
          :class="{ 'border-red-500': errorStore.fieldMessage('password_confirmation') }"
          class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
        <ErrorMessage :errorMessage="errorStore.fieldMessage('password_confirmation')"></ErrorMessage>
      </div>

      <div v-if="errorMessage" class="text-red-500 text-sm">
        {{ errorMessage }}
      </div>

      <div v-if="successMessage" class="text-green-500 text-sm">
        {{ successMessage }}
      </div>

      <Button class="mt-1" type="submit">Register</Button>
    </form>
  </div>
</template>
