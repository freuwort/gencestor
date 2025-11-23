import { eq } from "drizzle-orm"
import z from "zod"

const requestParamsSchema = z.object({
    id: z.coerce.number(),
})

export default defineEventHandler(async (event) => {
    const requestParams = await getValidatedRouterParams(event, requestParamsSchema.parse)

    const result = await useDrizzle().query.pedigrees.findFirst({
        with: { animals: true },
        where: eq(tables.pedigrees.id, requestParams.id),
    })

    if (!result) throw createError({ statusCode: 404, statusMessage: "Pedigree not found" })

    // @ts-ignore
    result.father = await getTree(result.animals[0]?.fatherId, 4)
    // @ts-ignore
    result.mother = await getTree(result.animals[0]?.motherId, 4)

    return result
})

async function getTree(childId: number, generations: number): Promise<Animal | null> {
    if (generations <= 0) return null
    if (!childId) return null

    const child = await useDrizzle().query.animals.findFirst({
        where: eq(tables.animals.id, childId),
    })

    if (!child) return null

    child.father = child.fatherId ? await getTree(child.fatherId, generations - 1) : null
    child.mother = child.motherId ? await getTree(child.motherId, generations - 1) : null

    return child
}