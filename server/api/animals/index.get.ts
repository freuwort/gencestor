import { and, asc, desc, inArray, like, notInArray, or } from 'drizzle-orm'
import { z } from 'zod'

const requestQuerySchema = z.object({
    query: z.string().max(100).optional(),
    sex: z.union([z.enum(['male', 'female', 'unknown']), z.array(z.enum(['male', 'female', 'unknown']))]).optional()
        .transform((val) => val === undefined ? undefined : (Array.isArray(val) ? val : [val])),
    exclude: z.union([z.coerce.number(), z.array(z.coerce.number())]).optional()
        .transform((val) => val === undefined ? undefined : (Array.isArray(val) ? val : [val])),
    page: z.coerce.number().min(0).default(0),
    size: z.coerce.number().min(1).max(500).default(50),
})

export default defineEventHandler(async (event) => {
    const requestQuery = await getValidatedQuery(event, requestQuerySchema.parse)
    const dbQuery = []

    if (requestQuery.query) {
        dbQuery.push(or(
            like(tables.animals.displayName, `%${requestQuery.query}%`),
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
            mother: { columns: {id: true, displayName: true, sex: true} },
            father: { columns: {id: true, displayName: true, sex: true} },
        },
        where: and(...dbQuery),
        orderBy: asc(tables.animals.displayName),
    })
    
    return usePaginate(results, requestQuery.page, requestQuery.size)
})