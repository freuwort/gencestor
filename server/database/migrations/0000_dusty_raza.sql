CREATE TABLE `animals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`legacy_id` text,
	`chip_number` text,
	`studbook_number` text,
	`name` text,
	`kennel` text,
	`kennel_name_first` integer DEFAULT false NOT NULL,
	`display_name` text GENERATED ALWAYS AS (CASE WHEN "kennel_name_first" = 1 THEN trim("kennel" || ' ' || "name") ELSE trim("name" || ' ' || "kennel") END) VIRTUAL,
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
CREATE TABLE `pedigrees` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`display_name` text GENERATED ALWAYS AS (trim("title" || ' - ' || "kennel")) VIRTUAL,
	`title` text,
	`kennel` text,
	`address` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `settings_key_unique` ON `settings` (`key`);