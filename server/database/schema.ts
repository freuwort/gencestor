import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { relations, SQL, sql } from 'drizzle-orm'

export const settings = sqliteTable('settings', {
    key: text('key').primaryKey().unique(),
    value: text('value'),
})

export const pedigrees = sqliteTable('pedigrees', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    displayName: text('display_name').generatedAlwaysAs((): SQL => sql`trim(${pedigrees.title} || ' - ' || ${pedigrees.kennel})`),
    title: text('title'),
    kennel: text('kennel'),
    address: text('address'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`).$onUpdate(() => new Date()),
})

// @ts-ignore
export const animals = sqliteTable('animals', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    legacyId: text('legacy_id'),
    chipNumber: text('chip_number'),
    studbookNumber: text('studbook_number'),
    name: text('name'),
    kennel: text('kennel'),
    kennelNameFirst: integer('kennel_name_first', { mode: 'boolean' }).notNull().default(false),
    displayName: text('display_name').generatedAlwaysAs((): SQL => sql`CASE WHEN ${animals.kennelNameFirst} = 1 THEN trim(${animals.kennel} || ' ' || ${animals.name}) ELSE trim(${animals.name} || ' ' || ${animals.kennel}) END`),
    awardsLength1: text('awards_length_1'),
    awardsLength2: text('awards_length_2'),
    awardsLength3: text('awards_length_3'),
    awardsLength4: text('awards_length_4'),
    notes: text('notes'),
    birthDate: integer('birth_date', { mode: 'timestamp' }),
    breed: text('breed'),
    sex: text('sex'),
    size: text('size'),
    hairType: text('hair_type'),
    hairColor: text('hair_color'),
    pedigreeId: integer('pedigree_id').references(() => pedigrees.id, { onDelete: 'set null', onUpdate: 'cascade' }),
    // @ts-ignore
    motherId: integer('mother_id').references(() => animals.id, { onDelete: 'set null', onUpdate: 'cascade' }),
    fatherId: integer('father_id').references(() => animals.id, { onDelete: 'set null', onUpdate: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`).$onUpdate(() => new Date()),
})

export const pedigreesRelations = relations(pedigrees, ({ many }) => ({
    animals: many(animals),
}))

export const animalsRelations = relations(animals, ({ one }) => ({
    mother: one(animals, { fields: [animals.motherId], references: [animals.id] }),
    father: one(animals, { fields: [animals.fatherId], references: [animals.id] }),
    pedigree: one(pedigrees, { fields: [animals.pedigreeId], references: [pedigrees.id] }),
}))