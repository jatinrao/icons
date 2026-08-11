CREATE TABLE `icons` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`label` text NOT NULL,
	`svg` text NOT NULL,
	`tags` text DEFAULT '[]' NOT NULL,
	`category` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `icons_name_unique` ON `icons` (`name`);