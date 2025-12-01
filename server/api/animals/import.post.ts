import { eq, inArray } from 'drizzle-orm'
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
    const db = useDrizzle()

    return await db.transaction(async (tx) => {
        // First, insert all animals in optimized chunks without parent references
        const chunkSize = 500 // Reduced chunk size for better memory management
        const insertedLegacyIds = new Set<string>()
        
        for (let i = 0; i < requestBody.data.length; i += chunkSize) {
            const chunk = requestBody.data.slice(i, i + chunkSize)
            
            // Prepare data without parent references and collect legacy IDs
            const insertData = chunk.map(item => {
                const { legacyFatherId, legacyMotherId, ...animalData } = item
                if (animalData.legacyId) {
                    insertedLegacyIds.add(animalData.legacyId)
                }
                return animalData
            })
            
            await tx.insert(tables.animals).values(insertData)
        }

        // Collect all legacy IDs that are referenced as parents
        const allReferencedLegacyIds = new Set<string>()
        for (const animalData of requestBody.data) {
            if (animalData.legacyFatherId) allReferencedLegacyIds.add(animalData.legacyFatherId)
            if (animalData.legacyMotherId) allReferencedLegacyIds.add(animalData.legacyMotherId)
        }

        // Only query for animals with legacy IDs that are actually referenced
        const referencedLegacyIdsArray = Array.from(allReferencedLegacyIds)
        let idDictionary: Record<string, number> = {}
        
        if (referencedLegacyIdsArray.length > 0) {
            // Process in chunks to avoid SQL query limits
            const queryChunkSize = 999 // SQLite IN clause limit
            for (let i = 0; i < referencedLegacyIdsArray.length; i += queryChunkSize) {
                const queryChunk = referencedLegacyIdsArray.slice(i, i + queryChunkSize)
                const animals = await tx
                    .select({ id: tables.animals.id, legacyId: tables.animals.legacyId })
                    .from(tables.animals)
                    .where(inArray(tables.animals.legacyId, queryChunk))

                for (const animal of animals) {
                    if (animal.legacyId) {
                        idDictionary[animal.legacyId] = animal.id
                    }
                }
            }
        }
        
        // Batch update parent references
        const updateBatches: Array<{legacyId: string, updates: Partial<Animal>}> = []
        
        for (const animalData of requestBody.data) {
            if (!animalData.legacyId) continue
            
            const updates: Partial<Animal> = {}

            if (animalData.legacyFatherId && idDictionary[animalData.legacyFatherId]) {
                updates.fatherId = idDictionary[animalData.legacyFatherId]
            }

            if (animalData.legacyMotherId && idDictionary[animalData.legacyMotherId]) {
                updates.motherId = idDictionary[animalData.legacyMotherId]
            }

            if (Object.keys(updates).length > 0) {
                updateBatches.push({ legacyId: animalData.legacyId, updates })
            }
        }

        // Execute updates in chunks to avoid memory issues
        const updateChunkSize = 100
        for (let i = 0; i < updateBatches.length; i += updateChunkSize) {
            const updateChunk = updateBatches.slice(i, i + updateChunkSize)
            
            // Execute updates in parallel for better performance
            await Promise.all(
                updateChunk.map(({ legacyId, updates }) =>
                    tx.update(tables.animals)
                        .set(updates)
                        .where(eq(tables.animals.legacyId, legacyId))
                )
            )
        }

        return { imported: requestBody.data.length, updated: updateBatches.length }
    })
})