<template>
    <USlideover :title="title" :description="description" v-model:open="isOpen">
        <template #body>
            <div class="flex flex-col">
                <UAlert class="mb-6" color="info" variant="subtle" title="Mit Ahnentafel verbunden" icon="i-lucide-book-open" v-if="hasPedigree" :actions="[{
                    label: 'Ahnentafel anzeigen',
                    as: 'a',
                    color: 'info',
                    variant: 'subtle',
                    target: '_blank',
                    href: `/pedigrees/${form.pedigreeId}`,
                }]" />

                <UAlert class="mb-6" color="error" variant="subtle" title="Mögliche Duplikate erkannt" icon="i-lucide-copy-slash" v-if="duplicates.length > 0"/>
                
                <template v-if="!hidden.includes('IDENTITY')">
                    <span class="mt-0 mb-2">Identität</span>
                    <div class="flex flex-col gap-4">
                        <div class="flex gap-2 items-center" :class="{'flex-row-reverse': form.kennelNameFirst}">
                            <UInput class="flex-1" v-model="form.name" placeholder="Name" leading-icon="i-lucide-tag" :autofocus="!form.kennelNameFirst" :disabled="disabled.includes('name')" v-if="!hidden.includes('name')"/>
                            <UButton @click="form.kennelNameFirst = !form.kennelNameFirst" color="neutral" variant="ghost" icon="i-lucide-arrow-right-left" :disabled="hasPedigree || disabled.includes('kennelNameFirst')"/>
                            <UInput class="flex-1" v-model="form.kennel" placeholder="Zwinger" leading-icon="i-lucide-house" :autofocus="form.kennelNameFirst" :disabled="hasPedigree || disabled.includes('kennel')" v-if="!hidden.includes('kennel')"/>
                        </div>
                        <UInput v-model="form.chipNumber" placeholder="Chipnummer" leading-icon="i-lucide-cpu" :disabled="disabled.includes('chipNumber')" v-if="!hidden.includes('chipNumber')"/>
                        <UInput v-model="form.studbookNumber" placeholder="Zuchtbuch-Nr." leading-icon="i-lucide-book-user" :disabled="disabled.includes('studbookNumber')" v-if="!hidden.includes('studbookNumber')"/>
                    </div>
                </template>
                

                <template v-if="!hidden.includes('BIRTH')">
                    <span class="mt-6 mb-2">Geburt</span>
                    <div class="flex flex-col gap-4">
                        <div class="flex items-center gap-1" v-if="!hidden.includes('breed')">
                            <UInputMenu class="flex-1" v-model="(form.breed as string)" :items="animalDataStore.breeds" createItem="always" @create="onCreateBreed" placeholder="Rasse" leading-icon="i-lucide-dog" :disabled="hasPedigree || disabled.includes('breed')"/>
                            <UButton color="neutral" variant="ghost" size="sm" icon="i-lucide-x" aria-label="Rasse entfernen" @click="form.breed = null" :disabled="!form.breed || hasPedigree || disabled.includes('breed')" />
                        </div>
                        <div class="flex items-center gap-1" v-if="!hidden.includes('sex')">
                            <USelect class="flex-1 pl-14 mr-8" v-model="(form.sex as string)" value-key="value" placeholder="Geschlecht" :items="sexItems" :disabled="disabled.includes('sex')">
                                <template #leading><AppSexIcon inner-class="size-4" class="w-9 h-6" :sex="form.sex" /></template>
                            </USelect>
                        </div>              
                        <div class="flex items-center gap-1" v-if="!hidden.includes('birthDate')">
                            <UInput class="flex-1" type="date" v-model="(form.birthDate as null)" leading-icon="i-lucide-calendar" :disabled="hasPedigree || disabled.includes('birthDate')"/>
                            <UButton color="neutral" variant="ghost" size="sm" icon="i-lucide-x" aria-label="Datum entfernen" @click="form.birthDate = null" :disabled="!form.birthDate || hasPedigree || disabled.includes('birthDate')" />
                        </div>
                    </div>
                </template>
                

                <template v-if="!hidden.includes('PARENTS')">
                    <span class="mt-6 mb-2">Eltern</span>
                    <div class="flex flex-col gap-4">
                        <div class="flex items-center gap-1" v-if="!hidden.includes('fatherId')">
                            <AppAnimalSelect :exclude="form.id ? [form.id] : []" :sex="['male', 'unknown']" @select="form.fatherId = $event.id; form.father = $event">
                                <UButton class="flex-1" color="neutral" variant="outline" size="xs" :disabled="hasPedigree || disabled.includes('fatherId')">
                                    <template #leading><AppSexIcon sex="male" inner-class="size-4" class="w-9 h-6 mr-1" /></template>
                                    {{ form.father ? form.father.displayName || '—' : 'Vater hinzufügen' }}
                                </UButton>
                            </AppAnimalSelect>
                            <UButton color="neutral" variant="ghost" size="sm" icon="i-lucide-x" aria-label="Vater entfernen" @click="form.fatherId = null; form.father = null" :disabled="!form.fatherId || hasPedigree || disabled.includes('fatherId')" />
                        </div>
                        <div class="flex items-center gap-1" v-if="!hidden.includes('motherId')">
                            <AppAnimalSelect :exclude="form.id ? [form.id] : []" :sex="['female', 'unknown']" @select="form.motherId = $event.id; form.mother = $event">
                                <UButton class="flex-1" color="neutral" variant="outline" size="xs" :disabled="hasPedigree || disabled.includes('motherId')">
                                    <template #leading><AppSexIcon sex="female" inner-class="size-4" class="w-9 h-6 mr-1" /></template>
                                    {{ form.mother ? form.mother.displayName || '—' : 'Mutter hinzufügen' }}
                                </UButton>
                            </AppAnimalSelect>
                            <UButton color="neutral" variant="ghost" size="sm" icon="i-lucide-x" aria-label="Mutter entfernen" @click="form.motherId = null" :disabled="!form.motherId || hasPedigree || disabled.includes('motherId')" />
                        </div>
                    </div>
                </template>


                <template v-if="!hidden.includes('APPEARANCE')">
                    <span class="mt-6 mb-2">Aussehen</span>
                    <div class="flex flex-col gap-4">
                        <div class="flex items-center gap-1" v-if="!hidden.includes('hairType')">
                            <UInputMenu class="flex-1" v-model="(form.hairType as string)" :items="animalDataStore.hairTypes" createItem="always" @create="onCreateHairType" placeholder="Haartyp" leading-icon="i-lucide-waves" :disabled="disabled.includes('hairType')" />
                            <UButton color="neutral" variant="ghost" size="sm" icon="i-lucide-x" aria-label="Haartyp entfernen" @click="form.hairType = null" :disabled="!form.hairType || disabled.includes('hairType')" />
                        </div>
                        <div class="flex items-center gap-1" v-if="!hidden.includes('hairColor')">
                            <UInputMenu class="flex-1" v-model="(form.hairColor as string)" :items="animalDataStore.hairColors" createItem="always" @create="onCreateHairColor" placeholder="Haarfarbe" leading-icon="i-lucide-palette" :disabled="disabled.includes('hairColor')" />
                            <UButton color="neutral" variant="ghost" size="sm" icon="i-lucide-x" aria-label="Haarfarbe entfernen" @click="form.hairColor = null" :disabled="!form.hairColor || disabled.includes('hairColor')" />
                        </div>
                        <div class="flex items-center gap-1" v-if="!hidden.includes('size')">
                            <UInput class="flex-1" v-model="form.size" placeholder="Größe" leading-icon="i-lucide-ruler" :disabled="disabled.includes('size')" />
                            <UButton color="neutral" variant="ghost" size="sm" icon="i-lucide-x" aria-label="Größe entfernen" @click="form.size = null" :disabled="!form.size || disabled.includes('size')" />
                        </div>
                    </div>
                </template>

                
                <template v-if="!hidden.includes('NOTES')">
                    <span class="mt-6 mb-2">Notizen</span>
                    <div class="flex flex-col gap-4">
                        <UTextarea v-model="form.notes" placeholder="Notizen" leading-icon="i-lucide-notebook" :disabled="disabled.includes('notes')" v-if="!hidden.includes('notes')" />
                        <USeparator />
                        <UTextarea v-model="form.awardsLength1" placeholder="Auszeichnungen 1. Gen" leading-icon="i-lucide-award" :disabled="disabled.includes('awardsLength1')" v-if="!hidden.includes('awardsLength1')" />
                        <UTextarea v-model="form.awardsLength2" placeholder="Auszeichnungen 2. Gen" leading-icon="i-lucide-award" :disabled="disabled.includes('awardsLength2')" v-if="!hidden.includes('awardsLength2')" />
                        <UTextarea v-model="form.awardsLength3" placeholder="Auszeichnungen 3. Gen" leading-icon="i-lucide-award" :disabled="disabled.includes('awardsLength3')" v-if="!hidden.includes('awardsLength3')" />
                        <UTextarea v-model="form.awardsLength4" placeholder="Auszeichnungen 4. Gen" leading-icon="i-lucide-award" :disabled="disabled.includes('awardsLength4')" v-if="!hidden.includes('awardsLength4')" />
                    </div>
                </template>
            </div>
        </template>

        <template #footer>
            <div class="flex-1 flex flex-row-reverse">
                <UFieldGroup>
                    <UButton label="Speichern" @click="save()" :loading="isLoading" />
                    <template v-if="!hidden.includes('ACTIONS')">
                        <UDropdownMenu :items="saveItems" arrow>
                            <UButton icon="i-lucide-chevron-down" />
                        </UDropdownMenu>
                    </template>
                </UFieldGroup>
                <div class="flex-1"></div>
                <UButton label="Abbrechen" variant="outline" @click="close" />
            </div>
        </template>
    </USlideover>
</template>

<script lang="ts" setup>
    import dayjs from 'dayjs'
    import { useDebounceFn } from '@vueuse/core'
    import type { AnimalStructure } from '~~/types/animal'
    type SaveMode = 'stayOpen' | 'createNew' | 'createDuplicate'
    type SlideoverField = 'IDENTITY' | 'BIRTH' | 'PARENTS' | 'APPEARANCE' | 'NOTES' | 'ACTIONS' | 'name' | 'kennelNameFirst' | 'kennel' | 'chipNumber' | 'studbookNumber' | 'birthDate' | 'breed' | 'sex' | 'hairType' | 'hairColor' | 'size' | 'fatherId' | 'motherId' | 'awardsLength1' | 'awardsLength2' | 'awardsLength3' | 'awardsLength4' | 'notes'
    type Callback = (animal: Partial<AnimalStructure>) => void

    const isOpen = ref(false)
    const isLoading = ref(false)
    const disabled = ref<SlideoverField[]>([])
    const hidden = ref<SlideoverField[]>([])
    const callback = ref<Callback | null>(null)
    const isEditing = computed(() => form.value.id != null)
    const hasPedigree = computed(() => form.value.pedigreeId != null)
    const title = computed(() => isEditing.value ? 'Tier bearbeiten' : 'Neues Tier erstellen')
    const description = computed(() => form.value.displayName || 'Unbennnt')
    const animalDataStore = useAnimalDataStore()

    const emit = defineEmits([
        'saved',
        'created',
        'updated',
        'closed',
    ])

    const form = ref<Partial<AnimalStructure>>({})

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


    
    const duplicates = ref<Animal[]>([])
    const fetchDuplicateAnimals = useDebounceFn(async () => {
        if (!form.value.name && !form.value.kennel) return duplicates.value = []

        duplicates.value = await $fetch<Animal[]>('/api/animals/duplicate-check', {
            method: 'GET',
            query: {
                self: form.value.id,
                name: form.value.name || '',
                kennel: form.value.kennel || '',
                breed: form.value.breed || '',
                sex: form.value.sex || '',
            }
        })
    }, 1000)
    watch(() => [form.value.name, form.value.kennel, form.value.breed, form.value.sex], fetchDuplicateAnimals, { immediate: false })



    function open(animal: Partial<AnimalStructure> = {}, cb: Callback | null = null, options: { disable?: SlideoverField[], hide?: SlideoverField[] } = {}) {
        reset()
        form.value = {
            ...form.value,
            ...animal,
            birthDate: animal.birthDate ? dayjs(animal.birthDate).format('YYYY-MM-DD') : null,
        }
        callback.value = cb
        disabled.value = options?.disable || []
        hidden.value = options?.hide || []
        isOpen.value = true
    }

    function close() {
        isOpen.value = false
        hidden.value = []
        disabled.value = []
        callback.value = null
        emit('closed')
    }

    function reset() {
        duplicates.value = []
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

    async function save(mode?: SaveMode) {
        isLoading.value = true
        isEditing.value ? await update() : await create()
        isLoading.value = false
        emit('saved')

        if (callback.value) callback.value(form.value)

        switch (mode) {
            case 'stayOpen': return;
            case 'createNew': reset(); return;
            case 'createDuplicate': form.value.id = null; return;
            default: close(); return;
        }
    }

    async function create() {
        let response = await $fetch('/api/animals', {
            method: 'POST',
            body: form.value,
        }) as Animal

        form.value.id = response.id

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