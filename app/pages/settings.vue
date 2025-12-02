<template>
    <UTabs :items="tabs" variant="link" :ui="{root: 'w-full max-w-[750px] mx-auto gap-0', content: 'flex flex-col gap-4 p-4', list: 'px-4 py-0', trigger: 'py-5'}">
        <template #pedigree>
            <form @submit.prevent="settingsStore.save" v-if="settingsStore.settings" class="contents">
                <UTextarea v-model="settingsStore.settings['general.notes']" placeholder="Bemerkungen" leading-icon="i-lucide-notebook" />
                <UButton class="ml-auto" variant="subtle" color="neutral" type="submit" :loading="settingsStore.isLoading">Speichern</UButton>
            </form>
        </template>
        <template #import>
            <div class="flex items-center">
                Alte Tierdaten im CSV-Format importieren.
                <UButton class="ml-auto" variant="subtle" color="neutral" @click="importAnimals()" :loading="isImportLoading">Tiere importieren</UButton>
                <input ref="fileInput" type="file" class="hidden" accept=".csv" @change="handleFileChange"/>
                <UPopover mode="hover">
                    <UIcon name="i-lucide-info" class="ml-2" />
                    <template #content>
                        <div class="p-3 max-w-96 text-sm">
                            <p>Der Importprozess kann einige Zeit in Anspruch nehmen, abhängig von der Anzahl der Datensätze.</p>
                            <p class="mt-2">Bitte stellen Sie sicher, dass die CSV-Datei korrekt formatiert ist, um Fehler während des Imports zu vermeiden.</p>
                            <p class="mt-2">Es wird <b>nicht</b> nach Duplikaten gesucht.</p>
                            <p class="mt-2">Vorhandene Daten werden <b>nicht</b> aktualisiert oder gelöscht.</p>
                            <p class="mt-2">Bitte sorgen Sie dafür, dass die legacyId eindeutig ist - auch in vorhandenen Datensätzen.</p>
                            <p class="mt-2">Die CSV-Datei kann folgende Spalten enthalten:</p>
                            <div class="text-mono bg-muted rounded-sm border border-default p-2 mt-2">
                                <b>legacyId</b> - Text<br>
                                <b>chipNumber</b> - Text<br>
                                <b>studbookNumber</b> - Text<br>
                                <b>name</b> - Text<br>
                                <b>kennel</b> - Text<br>
                                <b>kennelNameFirst</b> - Text ('true', 'false')<br>
                                <b>awardsLength1</b> - Text<br>
                                <b>awardsLength2</b> - Text<br>
                                <b>awardsLength3</b> - Text<br>
                                <b>awardsLength4</b> - Text<br>
                                <b>notes</b> - Text<br>
                                <b>birthDate</b> - Datum ('YYYY-MM-DD')<br>
                                <b>breed</b> - Text<br>
                                <b>sex</b> - Text ('male', 'female', 'unknown')<br>
                                <b>size</b> - Text<br>
                                <b>hairType</b> - Text<br>
                                <b>hairColor</b> - Text<br>
                                <b>fatherLegacyId</b> - Text<br>
                                <b>motherLegacyId</b> - Text
                            </div>
                        </div>
                    </template>
                </UPopover>
            </div>
        </template>
    </UTabs>

</template>

<script lang="ts" setup>
    useSeoMeta({
        title: 'Einstellungen',
        description: 'Anpassen der Anwendungseinstellungen',
    })
    
    const settingsStore = useSettingsStore()



    const tabs = computed(() => [
        {
            label: 'Ahnentafeln',
            icon: 'i-lucide-book-open',
            slot: 'pedigree',
        },
        {
            label: 'Import',
            icon: 'i-lucide-cloud-upload',
            slot: 'import',
        },
    ])



    const fileInput = ref()
    const isImportLoading = ref(false)

    function importAnimals() {
        fileInput.value?.click()
    }

    function handleFileChange(event: Event) {
        const input = event.target as HTMLInputElement
        if (input.files && input.files.length > 0) {
            const file = input.files[0]
            const reader = new FileReader()
            reader.onload = (e) => {
                const content = parseCSVtoJSON(e.target?.result as string)
                input.value = ''
                submitImportRequest(content)
            }
            reader.readAsText(file as Blob)
        }
    }

    function parseCSVtoJSON(csv: string) {
        const [headerLine, ...rows] = csv.split('\n')
        if (!headerLine || rows.length === 0) return []
        const headers = headerLine.split(',').map(h => h.trim())
        const animals = rows
            .filter(line => line.trim().length > 0)
            .map(line => {
                const values = line.split(',').map(v => v.trim())
                const animal: Record<string, any> = {}
                headers.forEach((header, index) => {
                    switch (header) {
                        case 'kennelNameFirst': animal[header] = values[index] === 'true' ? true : false; return
                        default: animal[header] = values[index] || null; return
                    }
                })
                return animal
            })
        return animals
    }

    async function submitImportRequest(data: any) {
        isImportLoading.value = true
        await useFetch('/api/animals/import', {
            method: 'POST',
            body: { data },
        })
        isImportLoading.value = false
    }
</script>

<style lang="sass" scoped>
</style>