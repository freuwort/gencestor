<template>
    <UModal :title="title" v-model:open="isOpen" :ui="{body: 'p-0!'}">
        <template #body>
            <UTabs :items="tabs" variant="link" :ui="{root: 'gap-0', content: 'flex flex-col gap-2 py-4 px-6 h-120 overflow-y-auto', list: 'px-4 py-0', trigger: 'py-5'}">
                <template #general>
                    <UInput v-model="form.title" placeholder="Wurfname" leading-icon="i-lucide-type" />
                    <UInput v-model="form.kennel" placeholder="Zwinger" leading-icon="i-lucide-house">
                        <template #trailing>
                            <UTooltip arrow text="Zwingername zuerst">
                                <div><USwitch v-model="form.kennelNameFirst" /></div>
                            </UTooltip>
                        </template>
                    </UInput>
                    <UInputMenu v-model="(form.breed as string)" :items="animalDataStore.breeds" createItem="always" @create="onCreateBreed" placeholder="Rasse" leading-icon="i-lucide-dog"/>
                    <UInput type="date" v-model="(form.birthDate as null)" leading-icon="i-lucide-calendar"/>
                    <UTextarea v-model="form.address" placeholder="Züchter / Adresse" leading-icon="i-lucide-info" />
                </template>
                <template #puppies>
                    <div class="flex items-center gap-2" v-for="animal in form.animals" :key="animal.tempId">
                        <AppSexIcon class="h-8 w-8" :sex="animal.sex" />
                        <div class="flex-1 flex flex-col">
                            <span>{{ animal.name }}</span>
                            <span class="text-sm text-muted">{{ animal.chipNumber }} | {{ animal.studbookNumber }}</span>
                        </div>
                        <UBadge variant="subtle" color="neutral" label="Prüfe" v-if="animal.status == 'pending'"/>
                        <UBadge variant="subtle" color="success" label="Neu" v-if="animal.status == 'new'"/>
                        <UBadge variant="subtle" color="info" label="Vorhanden" v-if="animal.status == 'existing'"/>
                        <UButton size="xs" variant="link" color="neutral" disabled loading icon="i-lucide-loader-circle" v-if="animal.status == 'pending'"/>
                    </div>
                </template>
                <template #family-tree>
                    <div class="flex items-center gap-2" v-for="animal in form.parents" :key="animal.legacyId">
                        <span class="flex-1">{{ animal.displayName }}</span>
                        <UBadge variant="subtle" color="neutral" icon="i-lucide-mars" v-if="animal.role == 'father'"/>
                        <UBadge variant="subtle" color="neutral" icon="i-lucide-venus" v-if="animal.role == 'mother'"/>
                        <UBadge variant="subtle" color="neutral" label="Prüfe" v-if="animal.status == 'pending'"/>
                        <UBadge variant="subtle" color="warning" label="Nicht gefunden" v-if="animal.status == 'no-match'"/>
                        <UBadge variant="subtle" color="success" label="Gefunden" v-if="animal.status == 'existing'"/>
                        <UButton size="xs" variant="link" color="neutral" disabled loading icon="i-lucide-loader-circle" v-if="animal.status == 'pending'"/>
                        <UPopover mode="click" arrow :content="{ align: 'center', side: 'right', sideOffset: 0 }">
                            <UButton variant="ghost" color="neutral" size="xs" icon="i-lucide-edit-2"/>
                            <template #content>
                                <UTextarea class="w-96" autoresize variant="none" v-model="animal.awardsLength1" v-if="animal.awardsLength1"/>
                                <UTextarea class="w-96" autoresize variant="none" v-model="animal.awardsLength2" v-if="animal.awardsLength2"/>
                                <UTextarea class="w-96" autoresize variant="none" v-model="animal.awardsLength3" v-if="animal.awardsLength3"/>
                                <UTextarea class="w-96" autoresize variant="none" v-model="animal.awardsLength4" v-if="animal.awardsLength4"/>
                            </template>
                        </UPopover>
                    </div>
                </template>
            </UTabs>
        </template>

        <template #footer>
            <div class="flex-1 flex flex-row-reverse">
                <UButton label="Importieren" @click="startImport()" :loading="isLoading"/>
                <div class="flex-1"></div>
                <UButton label="Abbrechen" variant="outline" @click="close" />
            </div>
        </template>
    </UModal>
</template>

<script lang="ts" setup>
    const animalDataStore = useAnimalDataStore()
    const isOpen = ref(false)
    const isLoading = ref(false)
    const form = ref<any>({})

    const title = computed(() => form.value.title || '.atd Datei importieren')

    const emit = defineEmits([
        'closed',
    ])



    const tabs = computed(() => [
        {
            label: 'Allgemeines',
            icon: 'i-lucide-book-open',
            slot: 'general',
        },
        {
            label: 'Welpen',
            icon: 'i-lucide-dog',
            slot: 'puppies',
        },
        {
            label: 'Stammbaum',
            icon: 'i-lucide-network',
            slot: 'family-tree',
        },
    ])

    function onCreateBreed(newBreed: string) {
        animalDataStore.breeds.push(newBreed)
        form.value.breed = newBreed
    }



    function open(atd: any = {}) {
        reset()
        
        const parents = buildParentsFromTree(atd.tree || [])
        form.value = {
            title: atd.title || '',
            kennel: atd.name || '',
            kennelNameFirst: atd.LNF || false,
            address: atd.address || '',
            breed: atd.race || '',
            birthDate: atd.date || '',
            animals: (atd.entries || []).map((entry: any) => ({
                tempId: Math.random().toString(36).substring(2, 15),
                id: null,
                name: entry.firstname || '',
                chipNumber: entry.chip || '',
                studbookNumber: entry.zbn || '',
                sex: entry.gender === 'MALE' ? 'male' : 'female',
                hairColor: entry.haircolor || '',
                status: 'pending',
            })),
            parents: parents,
        }
        isOpen.value = true
        startDuplicateCheck()
    }

    function buildParentsFromTree(tree: any[][]): any[] {
        if (!Array.isArray(tree)) return []
        const flat: any[] = []
        for (let genIndex = 0; genIndex < tree.length; genIndex++) {
            const generation = tree[genIndex] || []
            const genNumber = genIndex + 1
            const keyName = `awardsLength${genNumber}`
            for (let i = 0; i < generation.length; i++) {
                const node = generation[i]
                if (!node) continue
                const item: any = {
                    id: null,
                    legacyId: node.id ?? '',
                    displayName: node.name ?? '',
                    status: 'pending',
                    role: genNumber === 1 ? (i === 0 ? 'father' : 'mother') : null,
                }
                item[keyName] = node.desc ?? ''
                flat.push(item)
            }
        }
        return flat
    }

    async function startDuplicateCheck() {
        isLoading.value = true

        for (const animal of form.value.animals) {
            const result = await $fetch<Animal[]>('/api/animals/duplicate-check', {
                method: 'GET',
                query: {
                    exact: '1',
                    name: animal.name || '',
                    kennel: form.value.kennel || '',
                    breed: form.value.breed || '',
                    chipNumber: animal.chipNumber || '',
                    studbookNumber: animal.studbookNumber || '',
                    sex: animal.sex || '',
                }
            })

            if (result.length === 1) {
                animal.id = result[0]?.id
                animal.status = 'existing'
            }
            else {
                animal.status = 'new'
            }
        }

        for(const parent of form.value.parents) {
            const result = await $fetch<Animal[]>('/api/animals/duplicate-check', {
                method: 'GET',
                query: {
                    legacyId: parent.legacyId || '',
                }
            })

            if (result.length === 1) {
                parent.id = result[0]?.id
                parent.status = 'existing'
            }
            else {
                parent.status = 'no-match'
            }
        }

        isLoading.value = false
    }

    async function startImport() {
        isLoading.value = true
        
        const motherId = form.value.parents.find((p: any) => p.role === 'mother' && p.status === 'existing')?.id || null
        const fatherId = form.value.parents.find((p: any) => p.role === 'father' && p.status === 'existing')?.id || null
        
        const pedigree = await $fetch('/api/pedigrees', {
            method: 'POST',
            body: {
                title: form.value.title,
                kennel: form.value.kennel,
                address: form.value.address,
            },
        })

        for (const animal of form.value.animals.filter((a: any) => a.status === 'new')) {
            const newAnimal = await $fetch('/api/animals', {
                method: 'POST',
                body: {
                    name: animal.name,
                    kennel: form.value.kennel,
                    breed: form.value.breed,
                    birthDate: form.value.birthDate,
                    kennelNameFirst: form.value.kennelNameFirst,
                    chipNumber: animal.chipNumber,
                    studbookNumber: animal.studbookNumber,
                    hairColor: animal.hairColor,
                    sex: animal.sex,
                }
            })
            animal.id = newAnimal?.id
        }

        await $fetch('/api/pedigrees/' + pedigree?.id, {
            method: 'PUT',
            body: {
                title: form.value.title,
                kennel: form.value.kennel,
                address: form.value.address,
                kennelNameFirst: form.value.kennelNameFirst,
                breed: form.value.breed,
                birthDate: form.value.birthDate,
                animals: form.value.animals.map((a: any) => a.id),
                motherId: motherId,
                fatherId: fatherId,
            }
        })

        for (const parent of form.value.parents.filter((p: any) => p.id)) {
            let body = {}
            if (parent.awardsLength1) body = { ...body, awardsLength1: parent.awardsLength1 }
            if (parent.awardsLength2) body = { ...body, awardsLength2: parent.awardsLength2 }
            if (parent.awardsLength3) body = { ...body, awardsLength3: parent.awardsLength3 }
            if (parent.awardsLength4) body = { ...body, awardsLength4: parent.awardsLength4 }
            await $fetch('/api/animals/' + parent.id, { method: 'PUT', body })
        }

        isLoading.value = false
        navigateTo('/pedigrees/' + pedigree?.id)
        close()
    }

    function close() {
        isOpen.value = false
        emit('closed')
    }

    function reset() {
        form.value = {}
    }

    defineExpose({
        open,
        close
    })
</script>

<style lang="sass" scoped>
</style>