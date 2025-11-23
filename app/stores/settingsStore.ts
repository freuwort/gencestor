import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', () => {
    const settings = ref<Record<string, any>>({
        'margin.1.top': 5,
        'margin.1.bottom': 5,
        'margin.1.left': 5,
        'margin.1.right': 5,
        'margin.2.top': 5,
        'margin.2.bottom': 5,
        'margin.2.left': 5,
        'margin.2.right': 5,
        'margin.3.top': 5,
        'margin.3.bottom': 5,
        'margin.3.left': 5,
        'margin.3.right': 5,
    })

    async function fetch() {
        settings.value = { ...settings.value, ...(await $fetch<Record<string, any>>('/api/settings'))}
    }

    async function save() {
        await $fetch<Record<string, any>>('/api/settings', {
            method: 'put',
            body: settings.value,
        })
    }

    return {
        settings,
        fetch,
        save,
    }
})