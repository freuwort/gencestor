<template>
    <div class="flex">
        <div class="w-80 flex items-center gap-2 px-3 rounded-lg border border-accented">
            <UButton class="flex-1" color="neutral" variant="ghost" @click="emit('edit', {animal: animal})">
                <template #leading><AppSexIcon class="w-9 h-6" inner-class="size-4" :sex="animal.sex" /></template>
                {{ animal.displayName || '—' }}
            </UButton>
        </div>
        <div class="flex flex-col gap-2 pl-2" v-if="generation <= 3">
            <div class="flex-1 relative">
                <template v-if="animal?.father">
                    <UButton class="rounded-full absolute top-1/2 -translate-y-1/2 -left-4" icon="i-lucide-unlink" size="xs" color="neutral" variant="outline" @click="emit('assignParent', {parent: { id: null }, role: 'father', child: animal})"/>
                    <AppTreeBuilder :animal="animal.father" :generation="generation + 1" @edit="emit('edit', $event)" @assignParent="emit('assignParent', $event)" @createParent="emit('createParent', $event)" />
                </template>
                <UFieldGroup class="w-80" size="sm" v-else>
                    <UButton class="flex-1" icon="i-lucide-plus" variant="subtle" @click="emit('createParent', {role: 'father', child: animal})">Vater erstellen</UButton>
                    <AppAnimalSelect @select="emit('assignParent', {parent: $event, role: 'father', child: animal})" :sex="['male', 'unknown']">
                        <UButton class="flex-1" icon="i-lucide-search" variant="outline">Vater suchen</UButton>
                    </AppAnimalSelect>
                </UFieldGroup>
            </div>
            <div class="flex-1 relative">
                <template v-if="animal?.mother">
                    <UButton class="rounded-full absolute top-1/2 -translate-y-1/2 -left-4" icon="i-lucide-unlink" size="xs" color="neutral" variant="outline" @click="emit('assignParent', {parent: { id: null }, role: 'mother', child: animal})"/>
                    <AppTreeBuilder :animal="animal.mother" :generation="generation + 1" @edit="emit('edit', $event)" @assignParent="emit('assignParent', $event)" @createParent="emit('createParent', $event)" />
                </template>
                <UFieldGroup class="w-80" size="sm" v-else>
                    <UButton class="flex-1" icon="i-lucide-plus" variant="subtle" @click="emit('createParent', {role: 'mother', child: animal})">Mutter erstellen</UButton>
                    <AppAnimalSelect @select="emit('assignParent', {parent: $event, role: 'mother', child: animal})" :sex="['female', 'unknown']">
                        <UButton class="flex-1" icon="i-lucide-search" variant="outline">Mutter suchen</UButton>
                    </AppAnimalSelect>
                </UFieldGroup>
            </div>
        </div>
    </div>
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

    const emit = defineEmits([
        'edit',
        'createParent',
        'assignParent',
    ])
</script>

<style lang="sass" scoped>
</style>