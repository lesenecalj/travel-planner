CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL UNIQUE,
	`name` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text
);
