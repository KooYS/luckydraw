ALTER TABLE `events` ADD `title_image_url` varchar(500);--> statement-breakpoint
ALTER TABLE `events` ADD `poster_overlay` boolean DEFAULT true NOT NULL;