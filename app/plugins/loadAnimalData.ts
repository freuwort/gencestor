export default defineNuxtPlugin({
    name: 'load-animal-data',
    async setup()
    {
        const animalDataStore = useAnimalDataStore()
        await animalDataStore.fetch()
    }
})