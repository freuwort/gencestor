export default defineNuxtPlugin({
    name: 'load-settings',
    async setup()
    {
        const settingsStore = useSettingsStore()
        await settingsStore.fetch()
    }
})