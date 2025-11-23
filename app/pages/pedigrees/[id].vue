<template>
    <div class="h-full flex items-stretch">
        <div class="w-80 flex flex-col gap-4 p-4 border-r border-default">
            <UInput v-model="form.title" placeholder="Wurfname" leading-icon="i-lucide-tag" />
            <UInput v-model="form.kennel" placeholder="Zwingername" leading-icon="i-lucide-book-user" />
            <UTextarea v-model="form.address" placeholder="Adresse" leading-icon="i-lucide-map-pin" />
            <div class="flex-1"></div>
            <UButton label="Speichern" size="xl" icon="i-lucide-save" @click="save()" :loading="isLoading" />
        </div>
        <div class="flex-1 flex flex-col gap-4 p-4">
            <div class="flex flex-col rounded-lg border border-default">
                <UContextMenu :items="contextMenuItems" arrow>
                    <UTable :data="form.animals" :columns="columns" @select="onSelect" @contextmenu="onContextMenu">
                        <template #name-cell="{ row }">
                            <div class="flex gap-3 items-center">
                                <AppSexIcon class="w-8 h-8" :sex="row.original.sex" /> {{ row.original.name || '—' }}
                            </div>
                        </template>
        
                        <template #action-cell="{ row }">
                            <div class="flex items-center justify-end gap-1">
                                <UButton icon="i-lucide-edit-2" size="sm" color="neutral" variant="soft" aria-label="Bearbeiten" @click="editAnimal.open(row.original)"/>
                                <UButton icon="i-lucide-copy-plus" size="sm" color="neutral" variant="soft" aria-label="Duplizieren" @click="editAnimal.open({ ...row.original, id: null })"/>
                                <USeparator orientation="vertical" class="h-8 mx-1"/>
                                <UButton icon="i-lucide-minus" size="sm" color="error" variant="soft" aria-label="Entfernen" />
                            </div>
                        </template>
                    </UTable>
                </UContextMenu>
                <div class="flex justify-between border-t border-default p-4">
                    <div class="flex-1"></div>
                    <UButton label="Neuer Welpe" icon="i-lucide-plus" variant="soft" @click="editAnimal.open({ pedigreeId: id, kennel: form.kennel })" />
                </div>
            </div>
        </div>
    </div>


    <SlideoverEditAnimal ref="editAnimal" @saved="fetch"/>
</template>

<script lang="ts" setup>
    import type { ContextMenuItem, TableColumn } from '@nuxt/ui'
    import type { Row } from '@tanstack/vue-table'

    definePageMeta({
        validate: (route): boolean => !!route.params.id && !Number.isNaN(Number(route.params.id)),
    })

    useSeoMeta({
        title: 'Ahnentafel Details',
        description: 'Details und Bearbeitung einer Ahnentafel',
    })
    
    const id = Number(useRoute().params.id)
    const isLoading = ref(false)
    const form = ref<Partial<Pedigree>>({})
    const editAnimal = ref()



    const toast = useToast()
    const UButton = resolveComponent('UButton')
    const UDropdownMenu = resolveComponent('UDropdownMenu')
    const columns: TableColumn<Animal>[] = [
        {
            accessorKey: 'name',
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
            accessorKey: 'hairColor',
            header: 'Haarfarbe',
            cell: info => info.getValue() || '—',
        },
        {
            accessorKey: 'notes',
            header: 'Notizen',
            cell: info => info.getValue() || '—',
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
                onSelect: () => editAnimal.value.open({ ...row.original, id: null }),
            },
            { type: 'separator', },
            {
                label: 'Entfernen',
                icon: 'i-lucide-minus',
                color: 'error',
                // onSelect: () => deleteAnimal(row.original.id),
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



    function reset() {
        form.value = {
            title: '',
            kennel: '',
            address: '',
            animals: [],
            mother: null,
            father: null,
        }
    }

    async function fetch() {
        isLoading.value = true
        form.value = {...form.value, ...(await $fetch(`/api/pedigrees/${id}`))}
        isLoading.value = false
    }

    async function save() {
        isLoading.value = true
        isLoading.value = false
    }

    reset()
    fetch()
</script>

<style lang="sass" scoped>
</style>