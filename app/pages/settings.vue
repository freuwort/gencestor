<template>
    <form @submit.prevent="settingsStore.save" v-if="settingsStore.settings" class="flex flex-col items-start p-4 gap-4">
        <div class="inline-flex gap-4 h-60">
            <div class="flex-1 flex flex-col p-2 aspect-[1/1.414] rounded-lg border border-muted/50 bg-muted mt-6 relative">
                <span class="text-xs text-muted text-center absolute  inset-0 -top-5">Seite 1 Links</span>
                <div class="flex gap-4 justify-center">
                    <UInput type="number" v-model="settingsStore.settings['margin.1.top']" class="w-14 font-mono" />
                </div>
                <div class="flex-1 flex justify-between gap-2">
                    <UInput type="number" v-model="settingsStore.settings['margin.1.left']" class="w-14 font-mono" />
                    <UInput type="number" v-model="settingsStore.settings['margin.1.right']" class="w-14 font-mono" />
                </div>
                <div class="flex gap-4 justify-center">
                    <UInput type="number" v-model="settingsStore.settings['margin.1.bottom']" class="w-14 font-mono" />
                </div>
            </div>

            <div class="flex-1 flex flex-col p-2 aspect-[1/1.414] rounded-lg border border-muted/50 bg-muted mt-6 relative">
                <span class="text-xs text-muted text-center absolute  inset-0 -top-5">Seite 1 Rechts</span>
                <div class="flex gap-4 justify-center">
                    <UInput type="number" v-model="settingsStore.settings['margin.2.top']" class="w-14 font-mono" />
                </div>
                <div class="flex-1 flex justify-between gap-2">
                    <UInput type="number" v-model="settingsStore.settings['margin.2.left']" class="w-14 font-mono" />
                    <UInput type="number" v-model="settingsStore.settings['margin.2.right']" class="w-14 font-mono" />
                </div>
                <div class="flex gap-4 justify-center">
                    <UInput type="number" v-model="settingsStore.settings['margin.2.bottom']" class="w-14 font-mono" />
                </div>
            </div>

            <USeparator vertical class="border-l border-default" />
            
            <div class="flex-2 flex flex-col p-2 aspect-[1.414] rounded-lg border border-muted/50 bg-muted mt-6 relative">
                <span class="text-xs text-muted text-center absolute  inset-0 -top-5">Seite 2</span>
                <div class="flex gap-4 justify-center">
                    <UInput type="number" v-model="settingsStore.settings['margin.3.top']" class="w-14 font-mono" />
                </div>
                <div class="flex-1 flex justify-between gap-2">
                    <UInput type="number" v-model="settingsStore.settings['margin.3.left']" class="w-14 font-mono" />
                    <UInput type="number" v-model="settingsStore.settings['margin.3.right']" class="w-14 font-mono" />
                </div>
                <div class="flex gap-4 justify-center">
                    <UInput type="number" v-model="settingsStore.settings['margin.3.bottom']" class="w-14 font-mono" />
                </div>
            </div>
        </div>

        <UTextarea class="mt-2" v-model="settingsStore.settings['general.notes']" placeholder="Notizen" leading-icon="i-lucide-notebook" />
        
        <UButton type="submit">Speichern</UButton>
    </form>
</template>

<script lang="ts" setup>
    useSeoMeta({
        title: 'Einstellungen',
        description: 'Anpassen der Anwendungseinstellungen',
    })
    
    const settingsStore = useSettingsStore()
</script>

<style lang="sass" scoped>
</style>