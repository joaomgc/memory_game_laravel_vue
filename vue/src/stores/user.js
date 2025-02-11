import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useErrorStore } from '@/stores/error'
import { useRouter } from 'vue-router'
import { useToast } from '@/components/ui/toast/use-toast'
import { ToastAction } from '@/components/ui/toast'
import { h } from 'vue'
import { useAuthStore } from './auth'

export const useUserStore = defineStore('user', () => {
    const router = useRouter()
    const { toast } = useToast()
    const storeError = useErrorStore()
    const loggedInUserId = ref(null)
    const authStore = useAuthStore()

    const users = ref([])
    const filterByType = ref(null)
    const filterByBlocked = ref(null)
    const filteredUsers = ref([])

    const getUsers = async () => {
        try {
            const response = await axios.get('users')
            users.value = response.data.data // Storing the list of users
        } catch (error) {
            console.error('Failed to fetch users:', error)
            storeError.setErrorMessages(
                error.response.data.message,
                error.response.data.errors,
                error.response.status,
                'Failed to fetch users'
            )
        }
    }

    const totalUsers = computed(() => {
        return users.value ? users.value.length : 0
    })

    const totalFilteredUsers = computed(() => {
        return filteredUsers.value ? filteredUsers.value.length : 0
    })

    const applyFilters = () => {
        filteredUsers.value = users.value.filter(user => {
            if (filterByType.value) {
                return user.type === filterByType.value
            }
            return true
        })
    }

    const filterDescription = computed(() => {
        if (!filterByBlocked.value && !filterByType.value) {
            return 'All users'
        }
        let description = ''
        if (filterByType.value) {
            description += `Users of type ${filterByType.value}`
        }
        return description
    })

    const fetchUsers = async () => {
        storeError.resetMessages()
        const response = await axios.get('users')
        users.value = response.data.data
    }

    const getIndexOfUser = (userId) => {
        return users.value.findIndex((u) => u.id === userId)
    }

    const fetchUser = async (userId) => {
        storeError.resetMessages()
        const response = await axios.get('users/' + userId)
        const index = getIndexOfUser(userId)
        if (index > -1) {
            users.value[index] = Object.assign({}, response.data.data)
        }
        return response.data.data
    }

    const insertUser = async (user) => {
        storeError.resetMessages()
        try {
            const response = await axios.post('users', user)
            users.value.push(response.data.data)
            toast({
                description: `User #${response.data.data.id} was created!`,
                action: h(ToastAction, {
                    altText: `Open new user`,
                    onclick: () => {
                        router.push({
                            name: 'updateUser',
                            params: { id: response.data.data.id }
                        })
                    }
                }, {
                    default: () => `Open new user`,
                })
            })
            return response.data.data
        } catch (e) {
            storeError.setErrorMessages(e.response.data.message, e.response.data.errors, e.response.status, 'Error inserting user!')
            return false
        }
    }

    const toggleBlockedUser = async (user) => {
        let requestBody = {
            blocked: !user.blocked
        }
        storeError.resetMessages()

        if (user.type === 'A') {
            storeError.setErrorMessages("You can't block administrators!", 'Error blocking user!')
            return false
        }
        try {
            const response = await axios.patch('users/' + user.id + '/blocked', requestBody)
            const index = getIndexOfUser(user.id)
            if (index > -1) {
                users.value[index] = Object.assign({}, response.data.data)
            }
            return response.data.data
        } catch (e) {
            storeError.setErrorMessages(e.response.data.message, e.response.data.errors, e.response.status, 'Error toggling user blocked status!')
            return false
        }
    }

    const fetchLoggedInUserId = async () => {
        try {
            const response = await axios.get('users/me')
            loggedInUserId.value = response.data.id
        } catch (error) {
            console.error('Failed to fetch logged-in user:', error)
            storeError.setErrorMessages(
                error.response.data.message,
                error.response.data.errors,
                error.response.status,
                'Failed to fetch logged-in user'
            )
        }
    }

    const updateCoins = async (user, coins) => {
        storeError.resetMessages()
        const userId = user.id
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.put(
                'users/' + userId + '/coins',
                { coins },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            authStore.user.brain_coins_balance = response.data.data.brain_coins_balance;

            return response.data.data;
        } catch (e) {
            storeError.setErrorMessages('Error updating user coins!')
            return false
        }
    }

    const deleteUser = async (user) => {
        storeError.resetMessages()

        if (!loggedInUserId.value) {
            await fetchLoggedInUserId();
        }

        if (user.id === loggedInUserId.value && user.type === 'A') {
            storeError.setErrorMessages(
                "Administrators cannot delete their own account!", null, 403, "Action not allowed")
            toast({
                description: `You cannot delete your own admin account!`,
                variant: 'error',
            })
            return false
        }

        console.log('Deleting this user:', user)

        try {
             await axios.delete('users/' + user.id + '/delete')
            const index = getIndexOfUser(user.id)
            if (index > -1) {
                users.value.splice(index, 1)
            }
            applyFilters()
            return true
        } catch (e) {
            if (e.response) {
                storeError.setErrorMessages(e.response.data.message, e.response.data.errors, e.response.status, 'Error deleting user!')
            } else {
                storeError.setErrorMessages('Network error occurred while deleting user', null, 500, 'Error deleting user!')
            }
            return false
        }
    }

    return {
        users, getUsers, totalUsers, totalFilteredUsers, filteredUsers,
        filterDescription, filterByType, filterByBlocked,
        fetchUsers, fetchUser, insertUser, fetchLoggedInUserId, deleteUser, toggleBlockedUser, applyFilters, updateCoins
    }
})