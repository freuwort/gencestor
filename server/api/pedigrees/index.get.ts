import { and, desc, inArray, like, notInArray, or } from 'drizzle-orm'
import { z } from 'zod'

const requestQuerySchema = z.object({
    query: z.string().max(100).optional(),
    page: z.coerce.number().min(0).default(0),
    size: z.coerce.number().min(1).max(500).default(50),
})

export default defineEventHandler(async (event) => {
    const requestQuery = await getValidatedQuery(event, requestQuerySchema.parse)
    const dbQuery = []

    if (requestQuery.query) {
        dbQuery.push(or(
            like(tables.pedigrees.displayName, `%${requestQuery.query}%`),
            like(tables.pedigrees.address, `%${requestQuery.query}%`),
        ))
    }

    const results = await useDrizzle().query.pedigrees.findMany({
        where: and(...dbQuery),
        orderBy: desc(tables.pedigrees.createdAt),
    })
    
    return usePaginate(results, requestQuery.page, requestQuery.size)
})