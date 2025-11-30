<template>
    <div class="h-full flex items-center justify-center p-8 select-none">
        <div class="w-full max-w-[750px] mx-auto flex flex-col p-4">
            <h1 class="text-center text-4xl font-bold">Willkommen zurück!</h1>
            <p class="text-center text-lg mt-2">Schön, dich wiederzusehen.</p>
            <div class="inner-grid">
                <NuxtLink to="/pedigrees" class="button flex-col pedigrees">
                    <UIcon name="i-lucide-book-open" class="size-9 mt-3"/> Ahnentafeln
                </NuxtLink>
                <button class="button flex-row import" @click="useOpenAtd((content: string) => { importAtd.open(content)})">
                    <UIcon name="i-lucide-folder-open" class="size-6"/> .atd importieren
                </button>
                <NuxtLink to="/animals" class="button flex-col animals">
                    <UIcon name="i-lucide-dog" class="size-9 mt-3"/> Tierdatenbank
                </NuxtLink>
            </div>
        </div>
    </div>

    <ModalImportAtd ref="importAtd"/>
</template>

<script lang="ts" setup>
    useSeoMeta({
        title: 'Übersicht',
        description: 'Übersicht und Schnellzugriffe',
    })

    const importAtd = ref()
</script>

<style lang="sass" scoped>
.inner-grid
    display: grid
    grid-template-columns: 1fr 1fr
    grid-template-rows: 12rem 4rem
    grid-template-areas: "pedigrees animals" "import animals"
    gap: 1rem
    margin-top: 2rem

    .button
        display: flex
        align-items: center
        justify-content: center
        gap: .5rem
        font-weight: 600
        border: 2px solid var(--ui-border)
        border-radius: var(--radius-lg)
        transition: all 75ms

        &:hover,
        &:focus
            background-color: var(--ui-bg-muted)
            border-color: var(--ui-primary)
            color: var(--ui-primary)

        &:focus
            outline: 2px solid var(--ui-primary)
            outline-offset: 2px

    .import
        grid-area: import

    .pedigrees
        grid-area: pedigrees

    .animals
        grid-area: animals
</style>