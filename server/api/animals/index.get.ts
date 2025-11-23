import { and, desc, inArray, like, notInArray, or } from 'drizzle-orm'
import { z } from 'zod'

const requestQuerySchema = z.object({
    query: z.string().max(100).optional(),
    sex: z.array(z.enum(['male', 'female', 'unknown'])).optional(),
    exclude: z.array(z.coerce.number()).optional(),
    page: z.coerce.number().min(0).default(0),
    size: z.coerce.number().min(1).max(500).default(50),
})

export default defineEventHandler(async (event) => {
    const requestQuery = await getValidatedQuery(event, requestQuerySchema.parse)
    const dbQuery = []

    if (requestQuery.query) {
        // TODO: Fuzzy search
        dbQuery.push(or(
            like(tables.animals.name, `%${requestQuery.query}%`),
            like(tables.animals.kennel, `%${requestQuery.query}%`),
            like(tables.animals.chipNumber, `%${requestQuery.query}%`),
            like(tables.animals.studbookNumber, `%${requestQuery.query}%`),
        ))
    }

    if (requestQuery.sex) {
        dbQuery.push(inArray(tables.animals.sex, requestQuery.sex))
    }

    if (requestQuery.exclude) {
        dbQuery.push(notInArray(tables.animals.id, requestQuery.exclude))
    }

    const results = await useDrizzle().query.animals.findMany({
        with: {
            mother: { columns: {id: true, name: true, kennel: true, kennelNameFirst: true, sex: true} },
            father: { columns: {id: true, name: true, kennel: true, kennelNameFirst: true, sex: true} },
        },
        where: and(...dbQuery),
        orderBy: desc(tables.animals.createdAt),
    })
    
    return usePaginate(results, requestQuery.page, requestQuery.size)
})