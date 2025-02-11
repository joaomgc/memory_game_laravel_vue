import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useErrorStore } from '@/stores/error'

export const useTransactionStore = defineStore('transaction', () => {
    const storeError = useErrorStore()

    const transactions = ref([])
    const balance = ref(0)
    const loading = ref(false)

    const totalBrainCoins = computed(() => balance.value)
    const transactionHistory = computed(() => transactions.value)

    const fetchTransactions = async () => {
        loading.value = true
        storeError.resetMessages()
        try {
            const response = await axios.get('transactions/history')
            transactions.value = response.data.data
            balance.value = response.data.balance
        } catch (e) {
            storeError.setErrorMessages(
                e.response.data.message,
                e.response.data.errors,
                e.response.status,
                'Transaction Fetch Error!'
            )
        } finally {
            loading.value = false
        }
    }

    const purchaseBrainCoins = async (paymentDetails) => {
        loading.value = true
        storeError.resetMessages()
        try {
            const response = await axios.post('transactions/purchase', paymentDetails)

            // Directly update the balance with the response value
            balance.value = response.data.balance

            // Unshift the new transaction to the beginning of the transactions array
            transactions.value.unshift(response.data.transaction)

            return response.data
        } catch (e) {
            storeError.setErrorMessages(
                e.response.data.message,
                e.response.data.errors,
                e.response.status,
                'Purchase Failed!'
            )
            throw e
        } finally {
            loading.value = false
        }
    }

    return {
        transactions,
        balance,
        loading,
        totalBrainCoins,
        transactionHistory,
        fetchTransactions,
        purchaseBrainCoins
    }
})