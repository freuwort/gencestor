import { eq } from "drizzle-orm"
import z from "zod"

const requestParamsSchema = z.object({
    id: z.coerce.number(),
})

export default defineEventHandler(async (event) => {
    const requestParams = await getValidatedRouterParams(event, requestParamsSchema.parse)

    const result = await useDrizzle().query.animals.findFirst({
        with: {
            mother: { columns: {id: true, name: true, kennel: true, kennelNameFirst: true, sex: true} },
            father: { columns: {id: true, name: true, kennel: true, kennelNameFirst: true, sex: true} },
        },
        where: eq(tables.animals.id, requestParams.id),
    })

    return result
})