import { eq, isNotNull } from 'drizzle-orm'
import { z } from 'zod'

const requestBodySchema = z.object({
    data: z.array(z.object({
        legacyId: z.string().max(255).optional().nullable(),
        chipNumber: z.string().max(255).optional().nullable(),
        studbookNumber: z.string().max(255).optional().nullable(),
        name: z.string().max(255).optional().nullable(),
        kennel: z.string().max(255).optional().nullable(),
        kennelNameFirst: z.boolean().default(false).optional().nullable(),
        awardsLength1: z.string().max(1023).optional().nullable(),
        awardsLength2: z.string().max(1023).optional().nullable(),
        awardsLength3: z.string().max(1023).optional().nullable(),
        awardsLength4: z.string().max(1023).optional().nullable(),
        notes: z.string().max(1023).optional().nullable(),
        birthDate: z.coerce.date().optional().nullable(),
        breed: z.string().max(255).optional().nullable(),
        sex: z.enum(['male', 'female', 'unknown']).optional().nullable(),
        size: z.string().max(255).optional().nullable(),
        hairType: z.string().max(255).optional().nullable(),
        hairColor: z.string().max(255).optional().nullable(),
        // import specific fields:
        legacyFatherId: z.string().optional().nullable(),
        legacyMotherId: z.string().optional().nullable(),
    })).nonempty(),
})

export default defineEventHandler(async (event) => {
    const requestBody = await readValidatedBody(event, requestBodySchema.parse)

    // First, insert all animals but without parent references
    for (const animalData of requestBody.data) {
        await useDrizzle()
            .insert(tables.animals)
            .values(animalData)
    }

    // Then get the inserted animals to build a legacyId -> id dictionary
    const animalsWithLegacyIds = await useDrizzle()
        .select()
        .from(tables.animals)
        .where(isNotNull(tables.animals.legacyId))
        .all()

    const idDictionary: Record<string, number> = {}
    for (const animal of animalsWithLegacyIds) {
        idDictionary[animal.legacyId!] = animal.id
    }
    
    // Finally, update the parent references based on the legacy IDs
    for (const animalData of requestBody.data) {
        const updates: Partial<Animal> = {}

        if (animalData.legacyFatherId && idDictionary[animalData.legacyFatherId]) {
            updates.fatherId = idDictionary[animalData.legacyFatherId]
        }

        if (animalData.legacyMotherId && idDictionary[animalData.legacyMotherId]) {
            updates.motherId = idDictionary[animalData.legacyMotherId]
        }

        if (Object.keys(updates).length <= 0) continue

        await useDrizzle()
            .update(tables.animals)
            .set(updates)
            .where(eq(tables.animals.legacyId, animalData.legacyId!))
    }
})