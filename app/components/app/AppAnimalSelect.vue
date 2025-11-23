<template>
    <UInputMenu
        :items="items"
        value-key="id"
        label-key="displayName"
        open-on-focus
        reset-search-term-on-blur
        :filter-fields="['displayName', 'chipNumber', 'studbookNumber']"
        v-model:search-term="searchTerm"
        v-model:open="isOpen"
        v-model="modelValue"
        @blur="isOpen = false"
    >
        <template #item-label="{ item }">
            <div class="flex gap-2 items-center">
                <AppSexIcon :sex="item.sex" class="size-8" />
                <div class="flex flex-col">
                    <b>{{ item.displayName }}</b>
                    <span class="text-xs text-muted">Chip: <b>{{ item.chipNumber || '—' }}</b></span>
                    <span class="text-xs text-muted">ZB: <b>{{ item.studbookNumber || '—' }}</b></span>
                </div>
            </div>
        </template>
    </UInputMenu>
</template>

<script lang="ts" setup>
    const modelValue = defineModel<Animal | null>({ default: null })
    const props = defineProps({
        sex: {
            type: Array as () => ('male' | 'female' | 'unknown')[],
            default: () => [],
        },
        exclude: {
            type: Array as () => number[],
            default: () => [],
        },
    })

    const isOpen = ref(false)
    const searchTerm = ref('')
    const items = ref<Animal[]>([])

    async function fetch() {
        const { items: data } = await $fetch('/api/animals', {
            method: 'GET',
            query: {
                query: searchTerm.value,
                sex: props.sex,
                exclude: [-1, -1, ...props.exclude].filter(Boolean),
                size: 100,
            },
        })

        items.value = data.map((item: any) => ({
            ...item,
            displayName: conditionalReverse([item.name, item.kennel], item.kennelNameFirst).join(' '),
        }))
    }

    watch(searchTerm, () => fetch(), { immediate: true } )
</script>

<style lang="sass" scoped>
</style>