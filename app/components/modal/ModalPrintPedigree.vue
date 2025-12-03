<template>
    <UModal :title="title" v-model:open="isOpen" :loading="isLoading" :ui="{body: 'p-0! border-accented', header: 'border-accented'}">
        <template #body>
            <div class="flex flex-col border-b border-accented">
                <UTable ref="table" :data="form.animals" :columns="columns" :ui="{td: 'p-0!'}"/>
            </div>
            <div class="flex flex-col p-6 gap-4">
                <UCheckbox v-model="printFront"label="Vorderseite drucken" />
                <UCheckbox v-model="printBack"label="Rückseite drucken" />
                <USeparator />
                <UCheckbox v-model="printAsExportPedigree" label="Als Export-Ahnentafel drucken" />
            </div>
        </template>

        <template #footer>
            <div class="flex-1 flex flex-row-reverse">
                <UButton label="Drucken" @click="print()" :loading="isLoading" :disabled="disabled" />
                <div class="flex-1"></div>
                <UButton label="Abbrechen" variant="outline" @click="close" />
            </div>
        </template>
    </UModal>

    <div ref="anchor" class="hidden"></div>
</template>

<script lang="ts" setup>
    import type { TableColumn } from '@nuxt/ui'
    import type { Row } from '@tanstack/vue-table'
    import type { PedigreeStructure } from '~~/types/pedigree'
    import type { AnimalResource } from '~~/types/animal'

    const table = ref()
    const anchor = ref()
    const isOpen = ref(false)
    const isLoading = ref(false)
    const printAsExportPedigree = ref(false)
    const printFront = ref(true)
    const printBack = ref(true)
    const form = ref<Partial<PedigreeStructure>>({})

    const title = computed(() => `${form.value.title} - ${form.value.kennel}`)
    const selectedIds = computed(() => table.value?.tableApi?.getSelectedRowModel()?.rows?.map((row: Row<AnimalResource>) => row.original.id) || [])
    const disabled = computed(() => selectedIds.value.length === 0)

    const pdfUrl = computed(() => {
        let query = new URLSearchParams()

        query.append('isExport', printAsExportPedigree.value ? '1' : '')
        query.append('printFront', printFront.value ? '1' : '')
        query.append('printBack', printBack.value ? '1' : '')
        selectedIds.value.forEach((id: number) => query.append('include', id.toString()))

        return `/api/pedigrees/${form.value.id}/html?${query.toString()}`
    })

    const emit = defineEmits([
        'printed',
        'downloaded',
        'closed',
    ])

    

    const UCheckbox = resolveComponent('UCheckbox')
    const columns: TableColumn<AnimalResource>[] = [
        {
            id: 'name',
            accessorKey: 'name',
            header: ({ table }) => h('div', {class: 'flex gap-4 items-center'}, [
                h(UCheckbox, {
                    modelValue: table.getIsSomePageRowsSelected() ? 'indeterminate' : table.getIsAllPageRowsSelected(),
                    'onUpdate:modelValue': (value: boolean | 'indeterminate') => table.toggleAllPageRowsSelected(!!value),
                    'aria-label': 'Alle auswählen'
                }),
                h('b', 'Alle auswählen')
            ]),
            cell: ({ row }) => h(UCheckbox, {
                label: row.original.name,
                modelValue: row.getIsSelected(),
                ui: {wrapper: 'ml-4', label: 'py-2', root: 'px-4 flex items-center'},
                'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
                'aria-label': 'Zeile auswählen'
            })
        },
    ]



    function open(pedigree: Partial<PedigreeStructure> = {}) {
        reset()
        form.value = {
            id: pedigree.id,
            title: pedigree.title || '',
            kennel: pedigree.kennel || '',
            animals: pedigree.animals || [],
        }
        nextTick(() => {
            anchor.value.innerHTML = '' // Clear previous iframe
            table.value?.tableApi?.resetRowSelection(true) // Deselect all rows first
            table.value?.tableApi?.toggleAllPageRowsSelected(true) // Select all rows
        })
        isOpen.value = true
    }

    function close() {
        isOpen.value = false
        emit('closed')
    }

    function reset() {
        form.value = {
            id: null,
            title: '',
            kennel: '',
            animals: [],
        }
        printAsExportPedigree.value = false
        printFront.value = true
        printBack.value = true
    }

    async function print() {
        isLoading.value = true
        const iframe = document.createElement('iframe')
        iframe.src = pdfUrl.value
        anchor.value?.appendChild(iframe)
        
        iframe.onload = () => {
            iframe.contentWindow?.focus()
            iframe.contentWindow?.print()
            isLoading.value = false
            emit('printed')
        }
    }

    defineExpose({
        open,
        close
    })
</script>

<style lang="sass" scoped>
</style>