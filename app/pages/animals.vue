<template>
    <div class="h-full flex flex-col">
        <div class="flex justify-between border-b border-default p-4">
            <UInput v-model="query" placeholder="Suche" leading-icon="i-lucide-search">
                <template #trailing>
                    <UButton size="sm" variant="ghost" color="neutral" @click="fetch" icon="i-lucide-refresh-ccw" />
                </template>
            </UInput>
            <div class="flex-1"></div>
            <UButton color="primary" @click="editAnimal.open()" trailing-icon="i-lucide-plus">Neu anlegen</UButton>
        </div>

        <UContextMenu :items="contextMenuItems" arrow>
            <UTable sticky :data="items" :columns="columns" :loading="isLoading" @select="onSelect" @contextmenu="onContextMenu" class="flex-1">
                <template #name-cell="{ row }">
                    <div class="flex gap-3 items-center">
                        <AppSexIcon class="w-8 h-8" :sex="row.original.sex" />
                        <div class="flex flex-col">
                            <span>{{ row.original.displayName || '—' }}</span>
                            <NuxtLink class="text-sm text-info hover:underline" :to="`/pedigrees/${row.original.pedigreeId}`"  v-if="row.original.pedigreeId !== null">Zur Ahnentafel</NuxtLink>
                        </div>
                    </div>
                </template>
                <template #father-cell="{ row }">
                    <span v-if="row.original.father">{{ row.original.father.displayName || '—' }}</span>
                    <span v-else>—</span>
                </template>
                <template #mother-cell="{ row }">
                    <span v-if="row.original.mother">{{ row.original.mother.displayName || '—' }}</span>
                    <span v-else>—</span>
                </template>
                <template #action-cell="{ row }">
                    <div class="flex items-center justify-end gap-1">
                        <UDropdownMenu :items="getActions(row)" arrow>
                            <UButton icon="i-lucide-ellipsis-vertical" size="sm" color="neutral" variant="subtle" aria-label="Aktionen" />
                        </UDropdownMenu>
                    </div>
                </template>
            </UTable>
        </UContextMenu>

        <div class="flex justify-between border-t border-default p-4">
            <UPagination
                active-color="neutral"
                :default-page="pagination.page"
                :items-per-page="pagination.size"
                :total="pagination.totalItems"
                @update:page="(p) => pagination.page = p"
            />
            <USelect
                v-model="pagination.size"
                :items="[25, 50, 100, 250]"
            />
        </div>
    </div>

    <SlideoverEditAnimal ref="editAnimal" @saved="fetch"/>
</template>

<script lang="ts" setup>
    import dayjs from 'dayjs'
    import { useDebounceFn } from '@vueuse/core'
    import type { ContextMenuItem, TableColumn } from '@nuxt/ui'
    import type { Row } from '@tanstack/vue-table'

    useSeoMeta({
        title: 'Tiere',
        description: 'Übersicht aller Tiere',
    })

    const editAnimal = ref()
    const query = ref('')
    const items = ref<any[]>([])
    const isLoading = ref(false)
    const pagination = ref({
        page: 1,
        size: 50,
        totalItems: 0,
    })



    const toast = useToast()
    const UButton = resolveComponent('UButton')
    const UDropdownMenu = resolveComponent('UDropdownMenu')
    const columns: TableColumn<Animal>[] = [
        {
            id: 'name',
            header: 'Name',
        },
        {
            accessorKey: 'chipNumber',
            header: 'Chip-Nr.',
            cell: info => info.getValue() || '—',
        },
        {
            accessorKey: 'studbookNumber',
            header: 'ZB-Nr.',
            cell: info => info.getValue() || '—',
        },
        {
            accessorKey: 'breed',
            header: 'Rasse',
            cell: info => info.getValue() || '—',
        },
        {
            id: 'father',
            header: 'Vater',
        },
        {
            id: 'mother',
            header: 'Mutter',
        },
        {
            accessorKey: 'birthDate',
            header: 'Geburtstag',
            cell: info => info.getValue() ? dayjs(info.getValue() as string).format('DD.MM.YYYY') : '—',
        },
        {
            accessorKey: 'size',
            header: 'Größe',
            cell: info => info.getValue() ? `${info.getValue()} cm` : '—',
        },
        {
            accessorKey: 'hairType',
            header: 'Haartyp',
            cell: info => info.getValue() || '—',
        },
        {
            accessorKey: 'hairColor',
            header: 'Haarfarbe',
            cell: info => info.getValue() || '—',
        },
        {
            accessorKey: 'createdAt',
            header: 'Erstellt am',
            cell: info => info.getValue() ? dayjs(info.getValue() as string).format('DD.MM.YYYY') : '—',
        },
        {
            accessorKey: 'updatedAt',
            header: 'Zuletzt bearbeitet',
            cell: info => info.getValue() ? dayjs(info.getValue() as string).format('DD.MM.YYYY') : '—',
        },
        {
            id: 'action',
        },
    ]

    function getActions(row: Row<Animal>) {
        return [
            {
                label: 'Bearbeiten',
                icon: 'i-lucide-edit-2',
                onSelect: () => editAnimal.value.open(row.original),
            },
            {
                label: 'Duplizieren',
                icon: 'i-lucide-copy-plus',
                onSelect: () => editAnimal.value.open({ ...row.original, id: null, pedigreeId: null }),
            },
            { type: 'separator', },
            {
                label: 'Löschen',
                icon: 'i-lucide-trash',
                color: 'error',
                onSelect: () => deleteAnimal(row.original.id),
            },
        ]
    }
    
    const contextMenuItems = ref<ContextMenuItem[]>([])
    function onContextMenu(_: Event, row: Row<Animal>) {
        contextMenuItems.value = getActions(row) as ContextMenuItem[]
    }

    function onSelect(_: Event, row: Row<Animal>) {
        editAnimal.value.open(row.original)
    }



    const debounceFetch = useDebounceFn(fetch, 300)
    async function fetch() {
        isLoading.value = true
        const { items: results, totalItems } = await $fetch('/api/animals', {
            method: 'GET',
            params: {
                page: pagination.value.page,
                size: pagination.value.size,
                query: query.value,
            },
        })
        isLoading.value = false

        items.value = results
        pagination.value.totalItems = totalItems
    }

    async function deleteAnimal(id: number) {
        await $fetch(`/api/animals/${id}`, {
            method: 'DELETE',
        })

        toast.add({ title: 'Tier gelöscht', color: 'success', icon: 'i-lucide-circle-check' })
        fetch()
    }

    watch(query, debounceFetch)
    watch(() => [pagination.value.page, pagination.value.size], fetch)

    onMounted(() => fetch())
</script>

<style lang="sass" scoped>
</style>