import { z } from 'zod'

const requestBodySchema = z.object({
    title: z.string().max(255).optional().nullable(),
    kennel: z.string().max(255).optional().nullable(),
    address: z.string().max(255).optional().nullable(),
})

export default defineEventHandler(async (event) => {
    const requestBody = await readValidatedBody(event, requestBodySchema.parse)

    const result = await useDrizzle()
        .insert(tables.pedigrees)
        .values(requestBody)
        .returning() as Pedigree[]

    return result[0]
})