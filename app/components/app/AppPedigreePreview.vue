<template>
    <div class="bg-elevated rounded-lg relative overflow-hidden">
        <div class="controls">
            <UFieldGroup size="sm">
                <UButton icon="i-lucide-dog" @click="selectedPage = 'front'; reload()" :loading="isLoading" :variant="selectedPage === 'front' ? 'solid' : 'outline'"/>
                <UButton icon="i-lucide-network" @click="selectedPage = 'back'; reload()" :loading="isLoading" :variant="selectedPage === 'back' ? 'solid' : 'outline'"/>
            </UFieldGroup>
            <USelect class="w-20" size="sm" v-model="selectedScale" :items="[2,1.5,1,.75,.5,.25]" placeholder="Skalierung" @change="reload" />
            <USeparator class="h-6" orientation="vertical" />
            <USelect class="w-40" size="sm" v-model="selectedAnimal" value-key="id" label-key="name" :items="pedigree.animals || []" placeholder="Vorschau auswählen" @change="reload" />

            <div class="corner left"></div>
            <div class="corner right"></div>
        </div>

        <iframe ref="iframe" class="select-none bg-white border border-default drop-shadow-xl rounded-sm w-[297mm] h-[210mm] absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2" :style="{scale: selectedScale}"></iframe>
    </div>
</template>

<script lang="ts" setup>
    import type { PedigreeResource } from '~~/types/pedigree'

    const props = defineProps({
        pedigree: {
            type: Object as () => Partial<PedigreeResource>,
            required: true,
        },
    })

    const isLoading = ref(false)
    const selectedAnimal = defineModel('animal', { default: null, type: [Number, null] })
    const selectedPage = defineModel('page', { default: 'back', type: [String] })
    const selectedScale = defineModel('scale', { default: 1, type: [Number] })

    const iframe = ref()

    async function reload() {
        isLoading.value = true
        const html = await $fetch<string>(`/api/pedigrees/${props.pedigree.id}/html`, {
            method: 'GET',
            params: {
                include: selectedAnimal.value,
                printFront: selectedPage.value === 'front' ? '1' : '',
                printBack: selectedPage.value === 'back' ? '1' : '',
            },
        })

        const doc = iframe.value.contentWindow.document
        doc.open()
        doc.write(html)
        doc.close()
        isLoading.value = false
    }

    onMounted(() => {
        if (selectedAnimal.value === null && props.pedigree.animals && props.pedigree.animals.length > 0) {
            selectedAnimal.value = props.pedigree.animals[0].id
        }
        
        reload()
    })

    defineExpose({
        reload,
    })
</script>

<style lang="sass" scoped>
    .controls
        position: absolute
        top: 0
        left: 50%
        z-index: 10
        transform: translateX(-50%)
        display: flex
        gap: .5rem
        padding: .5rem
        padding-top: 0
        background: var(--ui-bg)
        border-radius: 0 0 var(--radius-lg) var(--radius-lg)

        .corner
            position: absolute
            width: var(--radius-lg)
            height: var(--radius-lg)
            overflow: hidden
            pointer-events: none
            top: 0
            transition: all 75ms

            &::after
                content: ''
                position: absolute
                bottom: -100%
                width: 200%
                height: 200%
                border-radius: 50%
                box-shadow: 0 0 0 100rem var(--ui-bg)

            &.left
                right: 100%
                &::after
                    left: -100%

            &.right
                left: 100%
                &::after
                    right: -100%
</style>