import type { PedigreeResource } from '~~/types/pedigree'
import { z } from 'zod'

const requestParamsSchema = z.object({
    id: z.coerce.number(),
})

const requestQuerySchema = z.object({
    include: z.union([z.array(z.coerce.number()), z.coerce.number()]).optional().default([]), 
    isExport: z.coerce.boolean().default(false),
    printFront: z.coerce.boolean().default(true),
    printBack: z.coerce.boolean().default(true),
})

export default defineEventHandler(async (event) => {
    const requestParams = await getValidatedRouterParams(event, requestParamsSchema.parse)
    const requestQuery = await getValidatedQuery(event, requestQuerySchema.parse)

    const includeIds = Array.isArray(requestQuery.include) ? requestQuery.include : [requestQuery.include]

    const settings = await $fetch('/api/settings') as Record<string, any>
    const pedigree = await $fetch('/api/pedigrees/'+requestParams.id) as PedigreeResource
    const motherTree = formatTree(pedigree.motherId !== null ? await $fetch('/api/animals/'+pedigree.motherId+'/tree', {params: { generations: 4 }}) : null)
    const fatherTree = formatTree(pedigree.fatherId !== null ? await $fetch('/api/animals/'+pedigree.fatherId+'/tree', {params: { generations: 4 }}) : null)

    const generalNotes = settings['general.notes'] ?? ''

    const data = pedigree.animals
        .filter((a: any) => includeIds.length > 0 ? includeIds.includes(a.id) : true)
        .map((animal: Animal) => ({
            subtitle: requestQuery.isExport ? '<span style="color:blue;">Export - Pedigree</span>' : '<span>Pedigree</span>',
            pedigreeName: pedigree.title,
            litterMaleCount: pedigree.maleCount,
            litterFemaleCount: pedigree.femaleCount,
            name: animal.name,
            kennel: pedigree.kennel,
            kennelNameFirst: pedigree.kennelNameFirst,
            displayName: animal.displayName,
            breed: pedigree.breed,
            hairColor: animal.hairColor,
            birthDate: useGermanDate(pedigree.birthDate),
            sex: useSexEnum(animal.sex),
            studbookNumber: animal.studbookNumber,
            chipNumber: animal.chipNumber,
            address: useNl2Br(pedigree.address),
            notes: useNl2Br([generalNotes, animal.notes].filter(Boolean).join('\n')),
            father: fatherTree,
            mother: motherTree,
        }))

    return await render(data, {
        printFront: requestQuery.printFront,
        printBack: requestQuery.printBack,
    })
})

function formatTree(animal: any): any {
    if (!animal) return null

    return {
        ...animal,
        displayName: animal.kennelNameFirst ? `${animal.kennel} ${animal.name}` : `${animal.name} ${animal.kennel}`,
        birthDate: useGermanDate(animal.birthDate),
        sex: useSexEnum(animal.sex),
        awardsLength1: useNl2Br(useColoredText(animal.awardsLength1)),
        awardsLength2: useNl2Br(useColoredText(animal.awardsLength2)),
        awardsLength3: useNl2Br(useColoredText(animal.awardsLength3)),
        awardsLength4: useNl2Br(useColoredText(animal.awardsLength4)),
        father: formatTree(animal.father),
        mother: formatTree(animal.mother),
    }
}

async function render(data: any, options: { printFront?: boolean; printBack?: boolean } = {}): Promise<string> {
    const TemplatePedigreeBase = await useStorage('assets:templates').getItem(`pedigree.base.html`) as string
    const TemplatePedigreeFront = await useStorage('assets:templates').getItem(`pedigree.front.html`) as string
    const TemplatePedigreeBack = await useStorage('assets:templates').getItem(`pedigree.back.html`) as string

    const assets = {
        images: {
            border: await loadAssetAsDataUrl('images/border.png'),
            fcm_logo: await loadAssetAsDataUrl('images/fcm.png'),
            drv_logo: await loadAssetAsDataUrl('images/drv.png'),
        },
        fonts: {
            headline: await loadAssetAsDataUrl('fonts/matura.ttf'),
            text: await loadAssetAsDataUrl('fonts/open-sans-variable.ttf'),
        },
    }

    let content = ''
    let lastData = {}

    for (const entry of data) {
        lastData = entry
        if (options?.printFront !== false) content += hydrate(TemplatePedigreeFront, assets, entry)
        if (options?.printBack !== false) content += hydrate(TemplatePedigreeBack, assets, entry)
    }
    return hydrate(TemplatePedigreeBase, assets, {...lastData, content})
}

function hydrate(template: string, assets: any, data: any): string {
    try {
        return new Function('data', 'assets', 'return `' + template + '`')(data, assets)
    } catch (error) {
        console.error('Error hydrating template:', error)
        throw new Error('Failed to hydrate template')
    }
}

async function loadAssetAsDataUrl(path: string): Promise<string> {
    const fileContent = await useStorage('assets').getItemRaw<ArrayBuffer>(path)
    if (!fileContent) {
        throw new Error(`Asset not found: ${path}`)
    }
    const base64Data = Buffer.from(fileContent).toString('base64')
    const extension = path.split('.').pop()?.toLowerCase()
    let mimeType = 'application/octet-stream'
    if (extension === 'png') mimeType = 'image/png'
    else if (extension === 'jpg' || extension === 'jpeg') mimeType = 'image/jpeg'
    else if (extension === 'ttf') mimeType = 'font/ttf'
    else if (extension === 'otf') mimeType = 'font/otf'
    return `data:${mimeType};base64,${base64Data}`
}