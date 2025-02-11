<script setup>
import { useTemplateRef, provide, ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { Button } from '@/components/ui/button'
import Toaster from '@/components/ui/toast/Toaster.vue';
import GlobalAlertDialog from '@/components/common/GlobalAlertDialog.vue'
import { useAuthStore } from '@/stores/auth'
import { useErrorStore } from '@/stores/error'
import 'primeicons/primeicons.css'
import { useToast } from '@/components/ui/toast/use-toast'
import ErrorMessage from '@/components/common/ErrorMessage.vue'

defineProps({
  users: {
    type: Array,
    required: true
  },
  readonly: {
    type: Boolean,
    default: false
  }
})

const userStore = useUserStore()
const {toast} = useToast()
const authStore = useAuthStore()
const errorStore = useErrorStore()

const alertDialog = useTemplateRef('alert-dialog')
provide('alertDialog', alertDialog)
const showRemoveAccountConfirmation = ref(false)
const removeAccountPassword = ref('')
const userToDelete = ref(null)

const currentPage = ref(1)
const itemsPerPage = 10

onMounted(async () => {
    await userStore.getUsers()
    userStore.applyFilters() // Apply filters after fetching users
})

const totalPages = computed(() => {
    return Math.ceil(userStore.filteredUsers.length / itemsPerPage)
})

const paginatedUsers = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return userStore.filteredUsers.slice(start, end)
})

const prevPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--
    }
}

const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value++
    }
}

const toggleBlockedStatus = async (user) => {
    const result = await userStore.toggleBlockedUser(user)
    if (result) {
        console.log(`User ${user.id} status updated!`)
    } else {
        console.error('Failed to update user status.')
    }
}

const initiateAccountRemoval = (user) => {
    showRemoveAccountConfirmation.value = true
    removeAccountPassword.value = ''
    errorStore.resetMessages()
    userToDelete.value = user
}

const confirmRemoveAccount = async () => {
    errorStore.resetMessages()

    if (!removeAccountPassword.value) {
        errorStore.setErrorMessages('Please enter your password to confirm account removal')
        return
    }

    const success = await userStore.deleteUser(userToDelete.value)
    if (success) {
        showRemoveAccountConfirmation.value = false
        toast({
            description: 'User account removed successfully',
        })
    } else {
        toast({
            description: 'Failed to remove user account',
            variant: 'destructive'
        })
    }
}

const cancelRemoveAccount = () => {
    showRemoveAccountConfirmation.value = false
    removeAccountPassword.value = ''
    errorStore.resetMessages()
    userToDelete.value = null
}

</script>

<template>
    <Toaster />
    <GlobalAlertDialog ref="alert-dialog"></GlobalAlertDialog>
    <div class="max-w-4xl mx-auto py-12">
        <h1 class="text-3xl font-bold mb-8 text-center">User List</h1>

        <!-- Button to create an admin -->
        <div class="flex justify-end mb-4">
            <RouterLink to="/register" class="bg-blue-500 text-white hover:bg-blue-700 rounded-full px-4 py-2">
                Create Administrator
            </RouterLink>
        </div>
        <div v-if="userStore.filteredUsers.length > 0" class="bg-white w-full">
            <table class="min-w-full bg-white border border-gray-300">
                <thead>
                    <tr>
                        <th class="py-2 border-b">Name</th>
                        <th class="py-2 border-b">Email</th>
                        <th class="py-2 border-b">Role</th>
                        <th class="py-2 border-b">Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="user in paginatedUsers" :key="user.id">
                        <td class="py-2 border-b text-center">{{ user.name }}</td>
                        <td class="py-2 border-b text-center">{{ user.email }}</td>
                        <td class="py-2 border-b text-center">{{ user.type || 'Regular' }}</td>
                        <td class="py-2 border-b text-center">
                            <button @click="toggleBlockedStatus(user)"
                                :class="user.blocked ? 'text-red-500' : 'text-green-500'">
                                {{ user.blocked ? 'Blocked' : 'Active' }}
                            </button>
                        </td>
                        <td v-if="authStore.userId !== user.id" class="py-2 border-b text-center">
                            <button @click="initiateAccountRemoval(user)" class="text-red-500 hover:text-red-700">
                                <i class="pi pi-trash text-lg"></i>
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Pagination Controls -->
            <div class="flex justify-center items-center mt-4 space-x-4">
                <Button @click="prevPage" :disabled="currentPage === 1"
                    class="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50">
                    Previous
                </Button>
                <span class="text-gray-700">
                    Page {{ currentPage }} of {{ totalPages }}
                </span>
                <Button @click="nextPage" :disabled="currentPage === totalPages"
                    class="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50">
                    Next
                </Button>
            </div>
        </div>
        <div v-else class="text-center py-8 text-gray-500">
            <p>No users found.</p>
        </div>
        <!-- Account Removal Confirmation Modal -->
        <div v-if="showRemoveAccountConfirmation"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white p-6 rounded-lg shadow-xl w-96">
                <h2 class="text-xl font-bold mb-4 text-red-600">Confirm User Removal</h2>
                <p class="mb-4 text-gray-700">Enter your password to confirm user removal:</p>

                <div class="space-y-2 mb-4">
                    <input type="password" v-model="removeAccountPassword" placeholder="Enter your password"
                        class="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                    <ErrorMessage :errorMessage="errorStore.message"></ErrorMessage>
                </div>

                <div class="flex justify-between">
                    <Button @click="confirmRemoveAccount" class="bg-red-500 hover:bg-red-700 text-white">
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