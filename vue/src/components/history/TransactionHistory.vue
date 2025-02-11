<script setup>
import { ref, computed, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { useTransactionStore } from '@/stores/transaction'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const transactionStore = useTransactionStore()

const currentPage = ref(1)
const itemsPerPage = 10
const isLoading = ref(true)

const fetchTransactions = async () => {
    isLoading.value = true
    await transactionStore.fetchTransactions()
    console.log('Fetched transaction history:', transactionStore.transactionHistory)
    isLoading.value = false
}

// Computed property to get paginated transaction history
const paginatedTransactionHistory = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return transactionStore.transactionHistory.slice(start, end)
})

// Computed property to calculate total pages
const totalPages = computed(() => {
    return Math.ceil(transactionStore.transactionHistory.length / itemsPerPage)
})

// Method to go to next page
const nextPage = () => {
    if (currentPage.value < totalPages.value) {
        currentPage.value++
    }
}

// Method to go to previous page
const prevPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--
    }
}

onMounted(async () => {
    await fetchTransactions()
})
</script>

<template>

    <div v-if="isLoading" class="flex flex-col items-center justify-center h-screen">
        <p class="text-xl font-bold text-gray-700">Page Loading...</p>
    </div>

    <h1 class="text-3xl font-bold mb-8 text-center">{{ authStore.userAdmin ? 'All Transactions History' : 'Your Transaction History' }}</h1>

    <div v-if="transactionStore.transactionHistory.length > 0" class="bg-white w-full">
        <table class="min-w-full bg-white border border-gray-300">
            <thead>
                <tr>
                    <th class="py-2 border-b">Date</th>
                    <th class="py-2 border-b">Type</th>
                    <th class="py-2 border-b">Euros</th>
                    <th class="py-2 border-b">Payment Type</th>
                    <th class="py-2 border-b">Payment Reference</th>
                    <th class="py-2 border-b">Brain Coins</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="transaction in paginatedTransactionHistory" :key="transaction.id">
                    <td class="py-2 border-b text-center">{{ transaction.transaction_datetime }}</td>
                    <td class="py-2 border-b text-center">{{ transaction.type }}</td>
                    <td class="py-2 border-b text-center">{{ transaction.euros }}</td>
                    <td class="py-2 border-b text-center">{{ transaction.payment_type }}</td>
                    <td class="py-2 border-b text-center">{{ transaction.payment_reference }}</td>
                    <td class="py-2 border-b text-center">{{ transaction.brain_coins }}</td>
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
        <p>No Transaction History Found</p>
    </div>
</template>
