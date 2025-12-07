<template>
    <div class="flex flex-col gap-2">
        <div v-if="father" class="flex gap-2">
            <UFieldGroup class="w-80" size="sm">
                <UButton color="neutral" variant="subtle" icon="i-lucide-unlink" @click="emit('assignParent', {parent: { id: null }, role: 'father', child: child ?? 'NONE'})"/>
                <UButton color="neutral" variant="subtle" :ui="{base: 'flex-1 py-1 overflow-hidden text-ellipsis', label: 'overflow-hidden whitespace-nowrap text-ellipsis'}">
                    <template #leading><AppSexIcon class="flex-none w-5 h-5" inner-class="size-3" :sex="father.sex" /></template>
                    <span class="whitespace-nowrap">{{ father.displayName || '—' }}</span>
                </UButton>
                <UButton color="neutral" variant="subtle" icon="i-lucide-edit-2"  @click="emit('edit', {animal: father})"/>
            </UFieldGroup>
            <AppTreeBuilder
                :mother="father?.mother"
                :father="father?.father"
                @edit="emit('edit', $event)"
                @assignParent="emit('assignParent', $event)"
                @createParent="emit('createParent', $event)"
            />
        </div>
        <UFieldGroup class="w-80" size="sm" v-else>
            <UButton class="flex-1" icon="i-lucide-plus" variant="subtle" @click="emit('createParent', {role: 'father', child: child ?? 'NONE'})">Vater erstellen</UButton>
            <AppAnimalSelect @select="emit('assignParent', {parent: $event, role: 'father', child: child ?? 'NONE'})" :sex="['male', 'unknown']">
                <UButton class="flex-1" icon="i-lucide-search" variant="outline">Vater suchen</UButton>
            </AppAnimalSelect>
        </UFieldGroup>
        
        <div v-if="mother" class="flex gap-2">
            <UFieldGroup class="w-80" size="sm">
                <UButton color="neutral" variant="subtle" icon="i-lucide-unlink" @click="emit('assignParent', {parent: { id: null }, role: 'mother', child: child ?? 'NONE'})"/>
                <UButton color="neutral" variant="subtle" :ui="{base: 'flex-1 py-1'}">
                    <template #leading><AppSexIcon class="w-5 h-5" inner-class="size-3" :sex="mother.sex" /></template>
                    {{ mother.displayName || '—' }}
                </UButton>
                <UButton color="neutral" variant="subtle" icon="i-lucide-edit-2"  @click="emit('edit', {animal: mother})"/>
            </UFieldGroup>
            <AppTreeBuilder :mother="mother?.mother" :father="mother?.father" @edit="emit('edit', $event)" @assignParent="emit('assignParent', $event)" @createParent="emit('createParent', $event)"/>
        </div>
        <UFieldGroup class="w-80" size="sm" v-else>
            <UButton class="flex-1" icon="i-lucide-plus" variant="subtle" @click="emit('createParent', {role: 'mother', child: child ?? 'NONE'})">Mutter erstellen</UButton>
            <AppAnimalSelect @select="emit('assignParent', {parent: $event, role: 'mother', child: child ?? 'NONE'})" :sex="['female', 'unknown']">
                <UButton class="flex-1" icon="i-lucide-search" variant="outline">Mutter suchen</UButton>
            </AppAnimalSelect>
        </UFieldGroup>
    </div>
</template>

<script lang="ts" setup>
    import type { AnimalResource } from '~~/types/animal'

    const props = defineProps({
        child: {
            type: Object as () => AnimalResource | null,
            default: null,
        },
        father: {
            type: Object as () => AnimalResource | null,
            default: null,
        },
        mother: {
            type: Object as () => AnimalResource | null,
            default: null,
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