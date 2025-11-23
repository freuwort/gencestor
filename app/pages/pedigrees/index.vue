<template>
    <div class="h-full flex flex-col">
        <div class="flex justify-between border-b border-default p-4">
            <UInput v-model="query" placeholder="Suche" leading-icon="i-lucide-search">
                <template #trailing>
                    <UButton size="xs" variant="ghost" color="neutral" @click="fetch" icon="i-lucide-refresh-ccw" />
                </template>
            </UInput>
            <div class="flex-1"></div>
            <UButton color="primary" @click="editPedigree.open()" trailing-icon="i-lucide-plus">Neu anlegen</UButton>
        </div>

        <UContextMenu :items="contextMenuItems" arrow>
            <UTable sticky :data="items" :columns="columns" @select="onSelect" @contextmenu="onContextMenu" class="flex-1">
                <template #action-cell="{ row }">
                    <UDropdownMenu :items="getActions(row)" arrow>
                        <UButton icon="i-lucide-ellipsis-vertical" color="neutral" variant="ghost" aria-label="Aktionen" />
                    </UDropdownMenu>
                </template>
            </UTable>
        </UContextMenu>

        <div class="flex justify-between border-t border-default p-4">
            <UPagination
                active-color="neutral"
                :default-page="pagination.page + 1"
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

    <SlideoverEditPedigree ref="editPedigree" @saved="fetch"/>
</template>

<script lang="ts" setup>
    import dayjs from 'dayjs'
    import type { ContextMenuItem, TableColumn } from '@nuxt/ui'
    import type { Row } from '@tanstack/vue-table'

    useSeoMeta({
        title: 'Ahnentafeln',
        description: 'Übersicht aller Ahnentafeln',
    })

    const editPedigree = ref()
    const query = ref('')
    const items = ref<any[]>([])
    const pagination = ref({
        page: 0,
        size: 50,
        totalPages: 10,
        totalItems: 0,
    })



    const toast = useToast()
    const UButton = resolveComponent('UButton')
    const UDropdownMenu = resolveComponent('UDropdownMenu')
    const columns: TableColumn<Pedigree>[] = [
        {
            accessorKey: 'title',
            header: 'Wurfname',
            cell: info => info.getValue() || '—',
        },
        {
            accessorKey: 'kennel',
            header: 'Zwingername',
            cell: info => info.getValue() || '—',
        },
        {
            accessorKey: 'address',
            header: 'Adresse',
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

    function getActions(row: Row<Pedigree>) {
        return [
            {
                label: 'Bearbeiten',
                icon: 'i-lucide-edit-2',
                to: `/pedigrees/${row.original.id}`,
            },
            {
                label: 'Umbennennen',
                icon: 'i-lucide-pen-line',
                onSelect: () => editPedigree.value.open(row.original),
            },
            {
                label: 'Duplizieren',
                icon: 'i-lucide-copy-plus',
                onSelect: () => editPedigree.value.open({ ...row.original, id: null }),
            },
            { type: 'separator', },
            {
                label: 'Löschen',
                icon: 'i-lucide-trash',
                color: 'error',
                onSelect: () => deletePedigree(row.original.id),
            },
        ]
    }
    
    const contextMenuItems = ref<ContextMenuItem[]>([])
    function onContextMenu(_: Event, row: Row<Pedigree>) {
        contextMenuItems.value = getActions(row) as ContextMenuItem[]
    }

    function onSelect(_: Event, row: Row<Pedigree>) {
        navigateTo(`/pedigrees/${row.original.id}`)
    }




    async function fetch() {
        const { items: results, page, size, totalPages, totalItems } = await $fetch('/api/pedigrees', {
            method: 'GET',
            params: {
                page: pagination.value.page,
                size: pagination.value.size,
                query: query.value,
            },
        })

        items.value = results
        pagination.value.page = page
        pagination.value.size = size
        pagination.value.totalPages = totalPages
        pagination.value.totalItems = totalItems
    }

    async function deletePedigree(id: number) {
        await $fetch(`/api/pedigrees/${id}`, {
            method: 'DELETE',
        })

        toast.add({ title: 'Ahnentafel gelöscht', color: 'success', icon: 'i-lucide-circle-check' })
        fetch()
    }

    watch(query, () => fetch())
    watch(() => pagination.value.page, () => fetch())
    watch(() => pagination.value.size, () => fetch())

    onMounted(() => fetch())
</script>

<style lang="sass" scoped>
</style>