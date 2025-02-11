<script setup>
import { ref } from 'vue';
import { useTransactionStore } from '@/stores/transaction';
import ErrorMessage from '@/components/common/ErrorMessage.vue';
//import SuccessMessage from '@/components/common/SuccessMessage.vue';
import { useRouter } from 'vue-router'
import { useToast } from '@/components/ui/toast/use-toast'

const transactionStore = useTransactionStore();
const router = useRouter()
const { toast } = useToast()


const paymentType = ref('MBWAY');
const paymentReference = ref('');
const amount = ref(1);
const loading = ref(false);
const error = ref(null);

function getReferencePlaceholder() {
    switch (paymentType.value) {
        case 'MBWAY': return '915785345';
        case 'IBAN': return 'PT50123456781234567812349';
        case 'MB': return '45634-123456789';
        case 'VISA': return '4321567812345678';
        default: return 'Enter reference';
    }
}

async function submitPurchase() {
    try {
        loading.value = true;
        const result = await transactionStore.purchaseBrainCoins({
            type: paymentType.value,
            reference: paymentReference.value,
            amount: amount.value
        });

        if (result) {
            toast({
                description: 'Brain Coins purchased successfully!',
            });
            router.push('/');
        } else {
            throw new Error('Purchase failed');
        }


        // Reset form
        paymentReference.value = '';
        amount.value = 1;
    } catch (err) {
        error.value = err.message || 'Purchase failed';
        toast.error(error.value);
    } finally {
        loading.value = false;
    }
}
</script>

<template>
    <div class="max-w-3xl mx-auto py-12">
        <h1 class="text-3xl font-bold mb-8">Purchase Brain Coins</h1>

        <ErrorMessage :errorMessage="error" />

        <form @submit.prevent="submitPurchase" class="space-y-6">
            <div class="space-y-2">
                <label for="paymentType" class="block text-sm font-medium text-gray-700">Payment Type</label>
                <select id="paymentType" v-model="paymentType" required
                    class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                    <option value="MBWAY">MBWay</option>
                    <option value="IBAN">IBAN</option>
                    <option value="MB">Multibanco</option>
                    <option value="VISA">Visa</option>
                </select>
            </div>

            <div class="space-y-2">
                <label for="paymentReference" class="block text-sm font-medium text-gray-700">Payment Reference</label>
                <input id="paymentReference" v-model="paymentReference" :placeholder="getReferencePlaceholder()"
                    required
                    class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
            </div>

            <div class="space-y-2">
                <label for="amount" class="block text-sm font-medium text-gray-700">Amount (€)</label>
                <input id="amount" type="number" v-model.number="amount" min="1" max="99" required
                    class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
            </div>

            <button type="submit" :disabled="loading"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                {{ loading ? 'Processing...' : 'Purchase Brain Coins' }}
            </button>
        </form>
    </div>
</template>