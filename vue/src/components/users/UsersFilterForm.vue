<script setup>
import { ref, watch } from 'vue'
import { useUserStore } from '@/stores/user'

const props = defineProps({
    showApplyButton: {
        type: Boolean,
        default: false
    }
})

const userStore = useUserStore()

const filterByType = ref(null)

const listOfUserTypes = ref([
    null,
    {
        'type': 'P',
        'filterDescription': 'Players'
    },
    {
        'type': 'A',
        'filterDescription': 'Admins'
    },
])

const resetFilter = () => {
    filterByType.value = null
    userStore.applyFilters()
}

const applyFilter = () => {
    userStore.filterByType = filterByType.value
    userStore.applyFilters()
    console.log('Filtering applied')
}

// Watch for changes in filter values and apply filters automatically
watch(filterByType, () => {
    applyFilter()
})

</script>

<template>
    <div class="py-2">
        <label for="input_filter_user_type_id" class="font-medium">Filter Users</label>
        <div class="flex flex-wrap px-1 space-x-3">
            <div class="ps-3 py-1 text-sm leading-10 flex space-x-1 grow">
                <label for="input_filter_user_type_id" class="font-medium">Type</label>
                <select 
                    id="input_filter_user_type_id" 
                    class="p-2 grow h-10 border-gray-300 border rounded-lg text-base"
                    v-model="filterByType"
                >
                    <option v-for="t in listOfUserTypes" :key="t ? t.type : 'null'" :value="t?.type || null">
                        {{ t ? t.filterDescription : '-- Any --' }}
                    </option>
                </select>
            </div>
            
            <button 
                type="button" 
                class="my-1 w-10 h-10 shrink-0 inline-flex justify-center items-center gap-x-2 text-sm font-bold rounded-md border border-transparent bg-gray-400 text-white hover:bg-gray-500 focus:outline-none focus:bg-gray-500"
                @click.prevent="resetFilter"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
            </button>
            <button v-show="showApplyButton" type="button" class="my-1  w-28 h-10 shrink-0 inline-flex justify-center items-center gap-x-2 text-sm font-bold rounded-md 
                                        border border-transparent bg-blue-600 text-white 
                                        hover:bg-blue-700 focus:outline-none focus:bg-blue-700"
                    @click.prevent="applyFilter">
                Apply Filter    
            </button>    
        </div>
    </div>
</template>