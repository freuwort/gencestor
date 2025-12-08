import { inArray, eq, notInArray, and } from 'drizzle-orm'
import { z } from 'zod'

const requestParamsSchema = z.object({
    id: z.coerce.number(),
})

const requestBodySchema = z.object({
    breeder: z.string().max(255).optional().nullable(),
    title: z.string().max(255).optional().nullable(),
    kennel: z.string().max(255).optional().nullable(),
    address: z.string().max(255).optional().nullable(),
    animals: z.array(z.coerce.number()),
    motherId: z.number().optional().nullable(),
    fatherId: z.number().optional().nullable(),
    breed: z.string().max(255).optional().nullable(),
    birthDate: z.coerce.date().optional().nullable(),
    kennelNameFirst: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
    const requestParams = await getValidatedRouterParams(event, requestParamsSchema.parse)
    const requestBody = await readValidatedBody(event, requestBodySchema.parse)

    // Update pedigree
    const result = await useDrizzle()
        .update(tables.pedigrees)
        .set({
            breeder: requestBody.breeder,
            title: requestBody.title,
            kennel: requestBody.kennel,
            address: requestBody.address,
        })
        .where(eq(tables.pedigrees.id, requestParams.id))
        .returning() as Pedigree[]

    // Sync animals
    await useDrizzle()
        .update(tables.animals)
        .set({
            pedigreeId: requestParams.id,
            kennel: requestBody.kennel || null,
            kennelNameFirst: requestBody.kennelNameFirst || false,
            breed: requestBody.breed || null,
            birthDate: requestBody.birthDate || null,
            motherId: requestBody.motherId || null,
            fatherId: requestBody.fatherId || null,
        })
        .where(inArray(tables.animals.id, requestBody.animals))

    // Unlink removed animals
    await useDrizzle()
        .update(tables.animals)
        .set({ pedigreeId: null })
        .where(and(
            eq(tables.animals.pedigreeId, requestParams.id),
            notInArray(tables.animals.id, requestBody.animals),
        ))

    return result[0]
})