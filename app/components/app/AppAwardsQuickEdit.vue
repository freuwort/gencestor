<template>
    <UPopover mode="click" v-model:open="isOpen" :content="{ side: 'right', sideOffset: 0 }">
        <slot/>
        <template #content>
            <div class="flex flex-col gap-2 p-2">
                <span class="text-sm text-muted px-1">{{ animal.displayName }}:</span>
                <UTextarea class="w-96" :placeholder="`Auszeichnungen ${props.generation}. Gen`" autoresize variant="subtle" v-model="awards"/>
                <UButton class="rounded-md!" @click="save" size="sm" :loading="isLoading">Speichern</UButton>
            </div>
        </template>
    </UPopover>
</template>

<script lang="ts" setup>
    import type { AnimalResource } from '~~/types/animal'

    const props = defineProps({
        animal: {
            type: Object as () => AnimalResource,
            required: true,
        },
        generation: {
            type: Number,
            default: 1,
        },
    })

    const awards = ref('')
    const isOpen = ref(false)
    const isLoading = ref(false)

    function load() {
        awards.value = props.animal[`awardsLength${props.generation}` as keyof AnimalResource] as string
    }

    async function save() {
        isLoading.value = true
        props.animal[`awardsLength${props.generation}` as keyof AnimalResource] = awards.value
        await $fetch('/api/animals/' + props.animal.id, { method: 'PUT', body: {[`awardsLength${props.generation}`]: awards.value }})
        isLoading.value = false
        isOpen.value = false
    }

    watch(isOpen, load)
</script>

<style lang="sass" scoped>
</style>