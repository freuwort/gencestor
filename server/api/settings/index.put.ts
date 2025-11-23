import { sql } from 'drizzle-orm'
import { z } from 'zod'

const requestBodySchema = z.object({
    'margin.1.top': z.number().optional().nullable(),
    'margin.1.bottom': z.number().optional().nullable(),
    'margin.1.left': z.number().optional().nullable(),
    'margin.1.right': z.number().optional().nullable(),
    'margin.2.top': z.number().optional().nullable(),
    'margin.2.bottom': z.number().optional().nullable(),
    'margin.2.left': z.number().optional().nullable(),
    'margin.2.right': z.number().optional().nullable(),
    'margin.3.top': z.number().optional().nullable(),
    'margin.3.bottom': z.number().optional().nullable(),
    'margin.3.left': z.number().optional().nullable(),
    'margin.3.right': z.number().optional().nullable(),
    'general.notes': z.string().optional().nullable(),
})

export default defineEventHandler(async (event) => {
    const requestBody = await readValidatedBody(event, requestBodySchema.parse)
    const settings = Object.entries(requestBody).map(([key, value]) => ({ key, value: JSON.stringify(value) }))

    await useDrizzle()
    .insert(tables.settings)
    .values(settings)
    .onConflictDoUpdate({
        target: [tables.settings.key],
        set: { value: sql`EXCLUDED.value` },
    })
})