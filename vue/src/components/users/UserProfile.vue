<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useErrorStore } from '@/stores/error'
import { Button } from '@/components/ui/button'
import ErrorMessage from '@/components/common/ErrorMessage.vue'
import { useGameStore } from '@/stores/game'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { useToast } from '@/components/ui/toast/use-toast'


const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()
const errorStore = useErrorStore()
const gameStore = useGameStore()
const { toast } = useToast()

let userProfile = ref({
    id: authStore.userId,
    email: authStore.userEmail,
    nickname: authStore.user ? authStore.user.nickname : '',
    name: authStore.userName,
    photo: authStore.userPhotoUrl,
    password: '',
    photo_filename: authStore.user ? authStore.user.photo_filename : ''
})

const removeAccountPassword = ref('')
const showRemoveAccountConfirmation = ref(false)

console.log('User Profile:', userProfile)

const uploadPhoto = async (file) => {
    const formData = new FormData()
    formData.append('photo', file)
    const response = await authStore.uploadPhoto(formData)
    if (response.photo_filename) {
        console.log('Photo uploaded:', response.photo_filename)
        userProfile.value.photo_filename = response.photo_filename
        userProfile.value.photo = authStore.userPhotoUrl // Update the photo URL
    }
}

const updateProfile = async () => {
    try {
        const updatedUser = await authStore.updateUser({
            ...userProfile.value,
            photo_filename: userProfile.value.photo_filename || undefined
        });
        if (updatedUser) {
            console.log('Profile updated:', updatedUser);
            authStore.user = updatedUser;
        }
    } catch (error) {
        console.error('Update error:', error.response?.data);
    }
}

const initiateAccountRemoval = () => {
    showRemoveAccountConfirmation.value = true
    removeAccountPassword.value = ''
    errorStore.resetMessages()
}

const confirmRemoveAccount = async (user) => {
    errorStore.resetMessages()

    if (!removeAccountPassword.value) {
        errorStore.setErrorMessages('Please enter your password to confirm account removal')
        return
    }
    if (!user){
        user = userStore.fetchUser()
    }
    try {
        const success = await userStore.deleteUser(user);
        if (success) {
        toast({
            description: 'Account removed successfully',
        });
        router.push('/');
        }
        
    } catch (error) {
        console.log('Error removing account:', error.response?.data)
    }
};

const cancelRemoveAccount = () => {
    showRemoveAccountConfirmation.value = false
    removeAccountPassword.value = ''
    errorStore.resetMessages()
}

const fetchGameHistory = async () => {
    await gameStore.fetchGameHistory()
    console.log('Fetched game history:', gameStore.gameHistory)
}

onMounted(async () => {
    await fetchGameHistory()
    try {
        // Assim ao dar refresh, os dados mantém-se
        userProfile.value = {
            id: authStore.userId,
            email: authStore.userEmail,
            nickname: authStore.user?.nickname || '',
            name: authStore.userName,
            photo: authStore.userPhotoUrl,
            password: '',
            photo_filename: authStore.user?.photo_filename || ''
        }
    } catch (error) {
        console.error('Error fetching user data:', error)
    }
})
</script>

<template>
    <div class="max-w-3xl mx-auto py-12">
        <h1 class="text-3xl font-bold mb-8">User Profile</h1>
        <form @submit.prevent="updateProfile" class="space-y-6">
            <div class="space-y-2">
                <label for="nickname" class="block text-sm font-medium text-gray-700">Nickname:</label>
                <input type="text" id="nickname" v-model="userProfile.nickname"
                    class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <ErrorMessage :errorMessage="errorStore.fieldMessage('nickname')"></ErrorMessage>
            </div>

            <div class="space-y-2">
                <label for="name" class="block text-sm font-medium text-gray-700">Name:</label>
                <input type="text" id="name" v-model="userProfile.name"
                    class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <ErrorMessage :errorMessage="errorStore.fieldMessage('name')"></ErrorMessage>
            </div>

            <div class="space-y-2">
                <label for="photo" class="block text-sm font-medium text-gray-700">Photo:</label>
                <input type="file" id="photo" @change="e => uploadPhoto(e.target.files[0])"
                    class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <ErrorMessage :errorMessage="errorStore.fieldMessage('photo')"></ErrorMessage>
            </div>

            <div class="space-y-2">
                <label for="password" class="block text-sm font-medium text-gray-700">Password:</label>
                <input type="password" id="password" v-model="userProfile.password"
                    class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                <ErrorMessage :errorMessage="errorStore.fieldMessage('password')"></ErrorMessage>
            </div>

            <Button type="submit">Update Profile</Button>
        </form>

        <Button v-if="!authStore.userAdmin" @click="initiateAccountRemoval" class="mt-4 bg-red-500 hover:bg-red-700 text-white">Remove Account</Button>

        <!-- Account Removal Confirmation Modal -->
        <div v-if="showRemoveAccountConfirmation"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white p-6 rounded-lg shadow-xl w-96">
                <h2 class="text-xl font-bold mb-4 text-red-600">Confirm Account Removal</h2>
                <p class="mb-4 text-gray-700">Enter your password to confirm account removal:</p>

                <div class="space-y-2 mb-4">
                    <input type="password" v-model="removeAccountPassword" placeholder="Enter your password"
                        class="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                    <ErrorMessage :errorMessage="errorStore.fieldMessage('name')"></ErrorMessage>
                </div>

                <div class="flex justify-between">
                    <Button @click="confirmRemoveAccount(userProfile)" class="bg-red-500 hover:bg-red-700 text-white">
                        Confirm Removal
                    </Button>
                    <Button @click="cancelRemoveAccount" class="bg-gray-300 hover:bg-gray-400 text-gray-800">
                        Cancel
                    </Button>
                </div>
            </div>
        </div>

    </div>
</template>