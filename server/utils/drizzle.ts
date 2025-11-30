import { drizzle } from 'drizzle-orm/libsql'

import * as schema from '../database/schema'

export const tables = schema

export function useDrizzle() {
  return drizzle('file:./.data/database.db', { schema })
}

export type Setting = typeof schema.settings.$inferSelect
export type Pedigree = typeof schema.pedigrees.$inferSelect
export type Animal = typeof schema.animals.$inferSelect
