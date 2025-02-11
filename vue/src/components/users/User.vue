<script setup>
import { useUserStore } from '@/stores/user'
import { inject } from 'vue'
import { RouterLink } from 'vue-router'

const storeUser = useUserStore()

const props = defineProps({
    user: Object,
    readonly: Boolean
})

const alertDialog = inject('alertDialog')

const deleteConfirmed = () => {
    storeUser.deleteUser(props.user)
}

const deleteUser = () => {
    alertDialog.value.open(deleteConfirmed, 'Are you sure?', 'Cancel', `Yes, delete user #${props.user.id}`,
        `This action cannot be undone. This will permanently delete the user #${props.user.id} "${props.user.name}" from our servers.`)
}
</script>

<template>    
    <div :class="{ 'bg-gray-200': readonly }">
        <div class="flex ps-2 pe-1">
            <div class="flex flex-col grow">
                <div class="text-base pe-4 grow leading-10 flex space-x-2">
                    <span class="w-12">#{{ user.id }}</span>
                    <span>{{ user.name }} ({{ user.email }})</span>
                </div>
                <span class="text-xs ps-4 pb-2 -mt-1 text-gray-500">
                    Type: {{ user.type === 'A' ? 'Admin' : 'Regular' }} | 
                    Blocked: {{ user.blocked ? 'Yes' : 'No' }}
                </span>
            </div>    
            <div v-show="!readonly" class="py-1 flex items-center min-w-[6.75rem]">
                <button type="button" class="rounded bg-green-500 p-2 m-0.5 text-white"
                    @click="storeUser.toggleBlockedUser(user)"
                    v-show="user.blocked">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="size-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                </button>
                <button type="button" class="inline-block rounded bg-blue-500 p-2 m-0.5 text-white"
                    @click="storeUser.toggleBlockedUser(user)"
                    v-show="!user.blocked">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="size-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                    </svg>
                </button>
                <button type="button" class="inline-block rounded bg-red-500 p-2 m-0.5 text-white"
                    @click="deleteUser">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" class="size-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                </button>
                <RouterLink :to="{ name: 'updateUser', params: { id: user.id }}" class="inline-block rounded bg-cyan-500 p-2 m-0.5 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                    </svg>
                </RouterLink>
            </div>
        </div>
    </div>
</template>
