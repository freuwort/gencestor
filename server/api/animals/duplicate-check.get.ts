import { and, eq, not, like } from 'drizzle-orm'
import { z } from 'zod'

const requestQuerySchema = z.object({
    exact: z.coerce.boolean().optional().default(false),
    self: z.coerce.number().optional(),
    name: z.string().optional(),
    kennel: z.string().optional(),
    breed: z.string().optional(),
    chipNumber: z.string().optional(),
    studbookNumber: z.string().optional(),
    legacyId: z.string().optional(),
    sex: z.enum(['male', 'female', 'unknown']).optional(),
})

export default defineEventHandler(async (event) => {
    const requestQuery = await getValidatedQuery(event, requestQuerySchema.parse)
    const dbQuery = []

    if (requestQuery.name && requestQuery.exact) dbQuery.push(eq(tables.animals.name, requestQuery.name))
    if (requestQuery.name && !requestQuery.exact) dbQuery.push(like(tables.animals.name, `%${requestQuery.name}%`))
    if (requestQuery.kennel && requestQuery.exact) dbQuery.push(eq(tables.animals.kennel, requestQuery.kennel))
    if (requestQuery.kennel && !requestQuery.exact) dbQuery.push(like(tables.animals.kennel, `%${requestQuery.kennel}%`))

    if (requestQuery.self) dbQuery.push(not(eq(tables.animals.id, requestQuery.self)))
    if (requestQuery.sex) dbQuery.push(eq(tables.animals.sex, requestQuery.sex))
    if (requestQuery.breed) dbQuery.push(eq(tables.animals.breed, requestQuery.breed))
    if (requestQuery.chipNumber) dbQuery.push(eq(tables.animals.chipNumber, requestQuery.chipNumber))
    if (requestQuery.studbookNumber) dbQuery.push(eq(tables.animals.studbookNumber, requestQuery.studbookNumber))
    if (requestQuery.legacyId) dbQuery.push(eq(tables.animals.legacyId, requestQuery.legacyId))

    return await useDrizzle().query.animals.findMany({
        columns: { id: true, name: true, kennel: true, kennelNameFirst: true },
        where: and(...dbQuery),
    })
})