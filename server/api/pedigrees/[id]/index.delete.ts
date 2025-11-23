import { eq } from "drizzle-orm"
import z from "zod"

const requestParamsSchema = z.object({
    id: z.coerce.number(),
})

export default defineEventHandler(async (event) => {
    const requestParams = await getValidatedRouterParams(event, requestParamsSchema.parse)
    
    await useDrizzle()
        .delete(tables.pedigrees)
        .where(eq(tables.pedigrees.id, requestParams.id))

    setResponseStatus(event, 204, 'Deleted')
})