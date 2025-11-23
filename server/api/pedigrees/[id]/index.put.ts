import { eq } from 'drizzle-orm'
import { z } from 'zod'

const requestParamsSchema = z.object({
    id: z.coerce.number(),
})

const requestBodySchema = z.object({
    title: z.string().max(255).optional().nullable(),
    kennel: z.string().max(255).optional().nullable(),
    address: z.string().max(255).optional().nullable(),
})

export default defineEventHandler(async (event) => {
    const requestParams = await getValidatedRouterParams(event, requestParamsSchema.parse)
    const requestBody = await readValidatedBody(event, requestBodySchema.parse)

    const result = await useDrizzle()
        .update(tables.pedigrees)
        .set(requestBody)
        .where(eq(tables.pedigrees.id, requestParams.id))
        .returning() as Pedigree[]

    // TODO: Sync animals' kennel names and parents

    return result[0]
})