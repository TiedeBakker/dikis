CREATE TABLE `beheer_metadata` (
	`id` text PRIMARY KEY NOT NULL,
	`tabel_naam` text NOT NULL,
	`tabel_label` text NOT NULL,
	`veld_id` text NOT NULL,
	`veld_label` text NOT NULL,
	`veld_type` text NOT NULL,
	`volgnummer` integer NOT NULL,
	`verplicht` integer DEFAULT false,
	`toelichting` text,
	`lookup_tabel` text
);
--> statement-breakpoint
CREATE TABLE `eenheden` (
	`id` text PRIMARY KEY NOT NULL,
	`naam` text NOT NULL,
	`symbool` text
);
--> statement-breakpoint
CREATE TABLE `gebouwen` (
	`id` text PRIMARY KEY NOT NULL,
	`straat` text NOT NULL,
	`nummer` text NOT NULL,
	`plaats` text NOT NULL,
	`korte_aanduiding` text,
	`postcode` text,
	`x_coordinaat` real,
	`y_coordinaat` real
);
--> statement-breakpoint
CREATE TABLE `groep_objecten` (
	`id` text PRIMARY KEY NOT NULL,
	`groep_id` text NOT NULL,
	`object_id` text NOT NULL,
	`object_type` text NOT NULL,
	FOREIGN KEY (`groep_id`) REFERENCES `groepen`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `groepen` (
	`id` text PRIMARY KEY NOT NULL,
	`naam` text NOT NULL,
	`toelichting` text,
	`standaard_set_id` text,
	FOREIGN KEY (`standaard_set_id`) REFERENCES `parameter_sets`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `keuzelijst_opties` (
	`id` text PRIMARY KEY NOT NULL,
	`keuzelijst_id` text NOT NULL,
	`waarde` text NOT NULL,
	`volgnr` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`keuzelijst_id`) REFERENCES `keuzelijsten`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `keuzelijsten` (
	`id` text PRIMARY KEY NOT NULL,
	`naam` text NOT NULL,
	`toelichting` text
);
--> statement-breakpoint
CREATE TABLE `logboek` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`categorie` text NOT NULL,
	`titel` text NOT NULL,
	`inhoud` text NOT NULL,
	`interpretatie` text
);
--> statement-breakpoint
CREATE TABLE `metingen` (
	`id` text PRIMARY KEY NOT NULL,
	`sessie_id` text NOT NULL,
	`object_id` text NOT NULL,
	`object_type` text NOT NULL,
	`parameter_id` text NOT NULL,
	`waarde` text NOT NULL,
	`datum_tijd` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`parameter_id`) REFERENCES `parameters`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `parameter_sets` (
	`id` text PRIMARY KEY NOT NULL,
	`naam` text NOT NULL,
	`toelichting` text
);
--> statement-breakpoint
CREATE TABLE `parameters` (
	`id` text PRIMARY KEY NOT NULL,
	`naam` text NOT NULL,
	`toelichting` text,
	`type` text DEFAULT 'numeriek' NOT NULL,
	`eenheid_id` text,
	`keuzelijst_id` text,
	FOREIGN KEY (`eenheid_id`) REFERENCES `eenheden`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`keuzelijst_id`) REFERENCES `keuzelijsten`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `personen` (
	`id` text PRIMARY KEY NOT NULL,
	`voornamen` text NOT NULL,
	`tussenvoegsel` text,
	`achternaam` text NOT NULL,
	`geboortedatum` text,
	`datum_overlijden` text,
	`telefoonnummer` text
);
--> statement-breakpoint
CREATE TABLE `set_regels` (
	`id` text PRIMARY KEY NOT NULL,
	`set_id` text NOT NULL,
	`parameter_id` text NOT NULL,
	`label` text,
	`verplicht` integer DEFAULT false NOT NULL,
	`volgnr` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`set_id`) REFERENCES `parameter_sets`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`parameter_id`) REFERENCES `parameters`(`id`) ON UPDATE no action ON DELETE cascade
);
