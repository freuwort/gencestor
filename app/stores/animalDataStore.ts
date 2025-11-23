import { defineStore } from 'pinia'

export const useAnimalDataStore = defineStore('animal-data', () => {
    const breeds = ref<string[]>([])
    const hairTypes = ref<string[]>([])
    const hairColors = ref<string[]>([])

    async function fetch() {
        breeds.value = await $fetch<string[]>('/api/animals/breeds')
        hairTypes.value = await $fetch<string[]>('/api/animals/hair-types')
        hairColors.value = await $fetch<string[]>('/api/animals/hair-colors')
    }

    return {
        breeds,
        hairTypes,
        hairColors,
        fetch,
    }
})