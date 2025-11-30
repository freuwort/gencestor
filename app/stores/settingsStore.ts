import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', () => {
    const settings = ref<Record<string, any>>({
        'general.notes': '',
    })

    const isLoading = ref(false)

    async function fetch() {
        isLoading.value = true
        settings.value = { ...settings.value, ...(await $fetch<Record<string, any>>('/api/settings'))}
        isLoading.value = false
    }

    async function save() {
        await $fetch<Record<string, any>>('/api/settings', {
            method: 'put',
            body: settings.value,
        })
    }

    return {
        settings,
        isLoading,
        fetch,
        save,
    }
})