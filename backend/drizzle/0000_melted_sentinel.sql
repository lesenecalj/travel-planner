CREATE TABLE `trips` (
	`id` text PRIMARY KEY NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`input` text NOT NULL,
	`plan` text NOT NULL,
	`label` text
);
