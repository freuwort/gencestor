<template>
    <template v-if="generation <= 4">
        <template v-if="father">
            <UFieldGroup size="sm" :style="{ gridArea: map+'m' }">
                <UButton color="neutral" variant="subtle" icon="i-lucide-unlink" @click="emit('assignParent', {parent: { id: null }, role: 'father', child: child ?? 'NONE'})"/>
                <AppAwardsQuickEdit :animal="father" :generation="generation">
                    <UButton color="neutral" variant="subtle" :ui="{base: 'flex-1 py-1'}">
                        <template #leading><AppSexIcon class="flex-none w-5 h-5" inner-class="size-3" :sex="father.sex" /></template>
                        {{ father.displayName || '—' }}
                    </UButton>
                </AppAwardsQuickEdit>
                <UButton color="neutral" variant="subtle" icon="i-lucide-edit-2"  @click="emit('edit', {animal: father})"/>
            </UFieldGroup>
            <AppTreeBuilder
                :mother="father?.mother"
                :father="father?.father"
                :child="father"
                :generation="generation + 1"
                :map="map+'m'"
                @edit="emit('edit', $event)"
                @assignParent="emit('assignParent', $event)"
                @createParent="emit('createParent', $event)"
            />
        </template>
        <template v-else>
            <UFieldGroup size="sm" :style="{ gridArea: map+'m' }">
                <UButton class="flex-1" icon="i-lucide-plus" variant="subtle" @click="emit('createParent', {role: 'father', child: child ?? 'NONE'})">Vater erstellen</UButton>
                <AppAnimalSelect @select="emit('assignParent', {parent: $event, role: 'father', child: child ?? 'NONE'})" :sex="['male', 'unknown']">
                    <UButton class="flex-1" icon="i-lucide-search" variant="outline">Vater suchen</UButton>
                </AppAnimalSelect>
            </UFieldGroup>
        </template>



        <template v-if="mother">
            <UFieldGroup size="sm" :style="{ gridArea: map+'f' }">
                <UButton color="neutral" variant="subtle" icon="i-lucide-unlink" @click="emit('assignParent', {parent: { id: null }, role: 'mother', child: child ?? 'NONE'})"/>
                <AppAwardsQuickEdit :animal="mother" :generation="generation">
                    <UButton color="neutral" variant="subtle" :ui="{base: 'flex-1 py-1'}">
                        <template #leading><AppSexIcon class="w-5 h-5" inner-class="size-3" :sex="mother.sex" /></template>
                        {{ mother.displayName || '—' }}
                    </UButton>
                </AppAwardsQuickEdit>
                <UButton color="neutral" variant="subtle" icon="i-lucide-edit-2"  @click="emit('edit', {animal: mother})"/>
            </UFieldGroup>
            <AppTreeBuilder
                :father="mother?.father"
                :mother="mother?.mother"
                :child="mother"
                :generation="generation + 1"
                :map="map+'f'"
                @edit="emit('edit', $event)"
                @assignParent="emit('assignParent', $event)"
                @createParent="emit('createParent', $event)"
            />
        </template>
        <template v-else>
            <UFieldGroup size="sm" :style="{ gridArea: map+'f' }">
                <UButton class="flex-1" icon="i-lucide-plus" variant="subtle" @click="emit('createParent', {role: 'mother', child: child ?? 'NONE'})">Mutter erstellen</UButton>
                <AppAnimalSelect @select="emit('assignParent', {parent: $event, role: 'mother', child: child ?? 'NONE'})" :sex="['female', 'unknown']">
                    <UButton class="flex-1" icon="i-lucide-search" variant="outline">Mutter suchen</UButton>
                </AppAnimalSelect>
            </UFieldGroup>
        </template>
    </template>
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
        map: {
            type: String,
            default: '',
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