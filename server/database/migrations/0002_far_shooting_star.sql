PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_animals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`legacy_id` text,
	`chip_number` text,
	`studbook_number` text,
	`name` text,
	`kennel` text,
	`kennel_name_first` integer DEFAULT false NOT NULL,
	`awards_length_1` text,
	`awards_length_2` text,
	`awards_length_3` text,
	`awards_length_4` text,
	`notes` text,
	`birth_date` integer,
	`breed` text,
	`sex` text,
	`size` text,
	`hair_type` text,
	`hair_color` text,
	`pedigree_id` integer,
	`mother_id` integer,
	`father_id` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`pedigree_id`) REFERENCES `pedigrees`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`mother_id`) REFERENCES `animals`(`id`) ON UPDATE cascade ON DELETE set null,
	FOREIGN KEY (`father_id`) REFERENCES `animals`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_animals`("id", "legacy_id", "chip_number", "studbook_number", "name", "kennel", "kennel_name_first", "awards_length_1", "awards_length_2", "awards_length_3", "awards_length_4", "notes", "birth_date", "breed", "sex", "size", "hair_type", "hair_color", "pedigree_id", "mother_id", "father_id", "created_at", "updated_at") SELECT "id", "legacy_id", "chip_number", "studbook_number", "name", "kennel", "kennel_name_first", "awards_length_1", "awards_length_2", "awards_length_3", "awards_length_4", "notes", "birth_date", "breed", "sex", "size", "hair_type", "hair_color", "pedigree_id", "mother_id", "father_id", "created_at", "updated_at" FROM `animals`;--> statement-breakpoint
DROP TABLE `animals`;--> statement-breakpoint
ALTER TABLE `__new_animals` RENAME TO `animals`;--> statement-breakpoint
PRAGMA foreign_keys=ON;