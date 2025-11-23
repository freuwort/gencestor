<template>
    <AppNavSkip href="#content" label="Zum Inhalt springen" icon="i-lucide-skip-forward"/>

    <div class="h-full flex flex-col p-1">
        <div class="flex items-center px-4 gap-2 h-14">
            <AppNavButton to="/" icon="i-lucide-layout-dashboard" tooltip="Übersicht" />
            <USeparator class="h-8" orientation="vertical" />
            <AppNavButton to="/animals" icon="i-lucide-dog" tooltip="Tiere" />
            <AppNavButton to="/pedigrees" icon="i-lucide-book-open" tooltip="Ahnentafeln" />
            <div class="flex-1"></div>
            <UColorModeButton size="lg"/>
            <USeparator class="ml-2 h-8" orientation="vertical" />
            <AppNavButton to="/settings" icon="i-lucide-settings" tooltip="Einstellungen" />
        </div>
        <div class="flex-1 bg-default rounded-lg overflow-auto" id="content">
            <slot></slot>
        </div>
    </div>
</template>

<script lang="ts" setup>
    useHead({
        titleTemplate: (title) => title ? `${title} – Gencestor` : 'Gencestor',
    })
</script>

<style lang="sass" scoped>
</style>