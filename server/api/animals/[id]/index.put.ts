import { eq } from 'drizzle-orm'
import { z } from 'zod'

const requestParamsSchema = z.object({
    id: z.coerce.number(),
})

const requestBodySchema = z.object({
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
    pedigreeId: z.number().optional().nullable(),
    motherId: z.number().optional().nullable(),
    fatherId: z.number().optional().nullable(),
})

export default defineEventHandler(async (event) => {
    const requestParams = await getValidatedRouterParams(event, requestParamsSchema.parse)
    const requestBody = await readValidatedBody(event, requestBodySchema.parse)

    const result = await useDrizzle()
        .update(tables.animals)
        .set(requestBody)
        .where(eq(tables.animals.id, requestParams.id))
        .returning() as Animal[]

    return result[0]
})