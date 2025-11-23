<template>
    <USlideover :title="title" :description="description" v-model:open="isOpen">
        <template #body>
            <div class="flex flex-col">
                <span>Identität</span>
                <div class="mt-2 flex gap-2 items-center" :class="{'flex-row-reverse': form.kennelNameFirst}">
                    <UInput class="flex-1" v-model="form.name" placeholder="Name" leading-icon="i-lucide-tag" :autofocus="!form.kennelNameFirst"/>
                    <UButton @click="form.kennelNameFirst = !form.kennelNameFirst" color="neutral" variant="ghost" icon="i-lucide-arrow-right-left" />
                    <UInput class="flex-1" v-model="form.kennel" placeholder="Zwinger" leading-icon="i-lucide-house" :autofocus="form.kennelNameFirst"/>
                </div>
                <UInput class="mt-4" v-model="form.chipNumber" placeholder="Chipnummer" leading-icon="i-lucide-cpu" />
                <UInput class="mt-4" v-model="form.studbookNumber" placeholder="Zuchtbuch-Nr." leading-icon="i-lucide-book-user" />
                

                <span class="mt-6">Geburt</span>
                <div class="mt-2 flex items-center gap-1">
                    <UInputMenu class="flex-1" v-model="(form.breed as string)" :items="animalDataStore.breeds" createItem="always" @create="onCreateBreed" placeholder="Rasse" leading-icon="i-lucide-dog" />
                    <UButton color="neutral" variant="ghost" size="sm" icon="i-lucide-x" aria-label="Rasse entfernen" @click="form.breed = null" :disabled="!form.breed" />
                </div>
                <div class="mt-4 flex items-center gap-1">
                    <USelect class="flex-1 pl-14 mr-8" v-model="(form.sex as string)" value-key="value" placeholder="Geschlecht" :items="sexItems">
                        <template #leading><AppSexIcon inner-class="size-4" class="w-9 h-6" :sex="form.sex" /></template>
                    </USelect>
                </div>              
                <div class="mt-4 flex items-center gap-1">
                    <UInput class="flex-1" type="date" v-model="(form.birthDate as null)" leading-icon="i-lucide-calendar"/>
                    <UButton color="neutral" variant="ghost" size="sm" icon="i-lucide-x" aria-label="Datum entfernen" @click="form.birthDate = null" :disabled="!form.birthDate" />
                </div>
                

                <span class="mt-6">Eltern</span>
                <div class="mt-2 flex items-center gap-1">
                    <AppAnimalSelect class="flex-1" :exclude="[form.id as number]" :sex="['male', 'unknown']" v-model="form.fatherId" placeholder="Vater auswählen" icon="i-lucide-mars"/>
                    <UButton color="neutral" variant="ghost" size="sm" icon="i-lucide-x" aria-label="Vater entfernen" @click="form.fatherId = null" :disabled="!form.fatherId" />
                </div>
                <div class="mt-4 flex items-center gap-1">
                    <AppAnimalSelect class="flex-1" :exclude="[form.id as number]" :sex="['female', 'unknown']" v-model="form.motherId" placeholder="Mutter auswählen" icon="i-lucide-venus"/>
                    <UButton color="neutral" variant="ghost" size="sm" icon="i-lucide-x" aria-label="Mutter entfernen" @click="form.motherId = null" :disabled="!form.motherId" />
                </div>


                <span class="mt-6">Aussehen</span>
                <div class="mt-2 flex items-center gap-1">
                    <UInputMenu class="flex-1" v-model="(form.hairType as string)" :items="animalDataStore.hairTypes" createItem="always" @create="onCreateHairType" placeholder="Haartyp" leading-icon="i-lucide-waves" />
                    <UButton color="neutral" variant="ghost" size="sm" icon="i-lucide-x" aria-label="Haartyp entfernen" @click="form.hairType = null" :disabled="!form.hairType" />
                </div>
                <div class="mt-4 flex items-center gap-1">
                    <UInputMenu class="flex-1" v-model="(form.hairColor as string)" :items="animalDataStore.hairColors" createItem="always" @create="onCreateHairColor" placeholder="Haarfarbe" leading-icon="i-lucide-palette" />
                    <UButton color="neutral" variant="ghost" size="sm" icon="i-lucide-x" aria-label="Haarfarbe entfernen" @click="form.hairColor = null" :disabled="!form.hairColor" />
                </div>
                <div class="mt-4 flex items-center gap-1">
                    <UInput class="flex-1" v-model="form.size" placeholder="Größe" leading-icon="i-lucide-ruler" />
                    <UButton color="neutral" variant="ghost" size="sm" icon="i-lucide-x" aria-label="Größe entfernen" @click="form.size = null" :disabled="!form.size" />
                </div>

                
                <span class="mt-6">Notizen</span>
                <UTextarea class="mt-2" v-model="form.notes" placeholder="Notizen" leading-icon="i-lucide-notebook" />
                <USeparator class="mt-4" />
                <UTextarea class="mt-4" v-model="form.awardsLength1" placeholder="Auszeichnungen 1. Gen" leading-icon="i-lucide-award" />
                <UTextarea class="mt-2" v-model="form.awardsLength2" placeholder="Auszeichnungen 2. Gen" leading-icon="i-lucide-award" />
                <UTextarea class="mt-2" v-model="form.awardsLength3" placeholder="Auszeichnungen 3. Gen" leading-icon="i-lucide-award" />
                <UTextarea class="mt-2" v-model="form.awardsLength4" placeholder="Auszeichnungen 4. Gen" leading-icon="i-lucide-award" />
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
    const title = computed(() => isEditing.value ? 'Tier bearbeiten' : 'Neues Tier erstellen')
    const description = computed(() => conditionalReverse([form.value.name || 'Unbenannt', form.value.kennel || ''], form.value.kennelNameFirst).join(' '))
    const animalDataStore = useAnimalDataStore()

    const emit = defineEmits([
        'saved',
        'created',
        'updated',
        'closed',
    ])

    const form = ref<Partial<Animal>>({})

    const sexItems = ref([
        { label: 'Rüde', icon: 'i-lucide-mars', value: 'male' },
        { label: 'Hündin', icon: 'i-lucide-venus', value: 'female' },
        { label: 'Unbekannt', icon: 'i-lucide-circle-question-mark', value: 'unknown' },
    ])

    const saveItems = ref([
        { label: 'Speichern und Neu', icon: 'i-lucide-plus', onSelect: () => save('createNew') },
        { label: 'Speichern und Duplikat', icon: 'i-lucide-copy-plus', onSelect: () => save('createDuplicate') },
        { label: 'Speichern ohne schließen', icon: 'i-lucide-save', onSelect: () => save('stayOpen') },
    ])



    function onCreateBreed(newBreed: string) {
        animalDataStore.breeds.push(newBreed)
        form.value.breed = newBreed
    }

    function onCreateHairType(newHairType: string) {
        animalDataStore.hairTypes.push(newHairType)
        form.value.hairType = newHairType
    }

    function onCreateHairColor(newHairColor: string) {
        animalDataStore.hairColors.push(newHairColor)
        form.value.hairColor = newHairColor
    }



    function open(animal: Partial<Animal> = {}) {
        reset()
        form.value = {
            ...form.value,
            ...animal,
            birthDate: animal.birthDate ? dayjs(animal.birthDate).format('YYYY-MM-DD') : null,
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
            chipNumber: '',
            studbookNumber: '',
            name: '',
            kennel: '',
            kennelNameFirst: false,
            awardsLength1: '',
            awardsLength2: '',
            awardsLength3: '',
            awardsLength4: '',
            notes: '',
            birthDate: null,
            breed: '',
            sex: 'male',
            size: '',
            hairType: '',
            hairColor: '',
            motherId: null,
            fatherId: null,
            pedigreeId: null,
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
        await $fetch('/api/animals', {
            method: 'POST',
            body: form.value,
        })

        emit('created')
    }
    
    async function update() {
        await $fetch('/api/animals/'+form.value.id, {
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