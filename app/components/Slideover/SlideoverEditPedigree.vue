<template>
    <USlideover :title="title" v-model:open="isOpen">
        <template #body>
            <div class="flex flex-col">
                <UInput class="mt-2" v-model="form.title" placeholder="Wurfname" leading-icon="i-lucide-tag" />
                <UInput class="mt-4" v-model="form.kennel" placeholder="Zwingername" leading-icon="i-lucide-book-user" />
                <UTextarea class="mt-4" v-model="form.address" placeholder="Adresse" leading-icon="i-lucide-map-pin" />
            </div>
        </template>

        <template #footer>
            <div class="flex-1 flex flex-row-reverse">
                <UFieldGroup>
                    <UButton label="Speichern" @click="save()" :loading="isLoading" />
                    <UDropdownMenu :items="saveItems" arrow>
                        <UButton icon="i-lucide-chevron-down" />
                    </UDropdownMenu>
                </UFieldGroup>
                <div class="flex-1"></div>
                <UButton label="Abbrechen" variant="outline" @click="close" />
            </div>
        </template>
    </USlideover>
</template>

<script lang="ts" setup>
    import dayjs from 'dayjs'

    const isOpen = ref(false)
    const isLoading = ref(false)
    const isEditing = computed(() => form.value.id != null)
    const title = computed(() => isEditing.value ? 'Ahnentafel bearbeiten' : 'Neue Ahnentafel erstellen')

    const emit = defineEmits([
        'saved',
        'created',
        'updated',
        'closed',
    ])

    const form = ref<Partial<Pedigree>>({})

    const saveItems = ref([
        { label: 'Speichern und Neu', icon: 'i-lucide-plus', onSelect: () => save('createNew') },
        { label: 'Speichern und Duplikat', icon: 'i-lucide-copy-plus', onSelect: () => save('createDuplicate') },
        { label: 'Speichern ohne schließen', icon: 'i-lucide-save', onSelect: () => save('stayOpen') },
    ])



    function open(pedigree: Partial<Pedigree> = {}) {
        reset()
        form.value = {
            ...form.value,
            ...pedigree,
        }
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
            address: '',
        }
    }

    async function save(mode?: 'stayOpen' | 'createNew' | 'createDuplicate') {
        isLoading.value = true
        isEditing.value ? await update() : await create()
        isLoading.value = false
        emit('saved')

        switch (mode) {
            case 'stayOpen': return;
            case 'createNew': reset(); return;
            case 'createDuplicate': form.value.id = null; return;
            default: close(); return;
        }
    }

    async function create() {
        await $fetch('/api/pedigrees', {
            method: 'POST',
            body: form.value,
        })

        emit('created')
    }
    
    async function update() {
        await $fetch('/api/pedigrees/'+form.value.id, {
            method: 'PUT',
            body: form.value,
        })

        emit('updated')
    }

    defineExpose({
        open,
        close
    })
</script>

<style lang="sass" scoped>
</style>