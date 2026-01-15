CREATE TABLE `draw_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`event_id` int NOT NULL,
	`product_id` int,
	`is_win` boolean NOT NULL,
	`product_name` varchar(255),
	`note` text,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `draw_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`primary_color` varchar(7) NOT NULL DEFAULT '#c026d3',
	`secondary_color` varchar(7) NOT NULL DEFAULT '#701a75',
	`background_color` varchar(7) NOT NULL DEFAULT '#fdf4ff',
	`text_color` varchar(7) NOT NULL DEFAULT '#1f2937',
	`accent_color` varchar(7) NOT NULL DEFAULT '#e879f9',
	`poster_url` varchar(500),
	`logo_url` varchar(500),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`event_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`image_url` varchar(500),
	`probability` decimal(5,2) NOT NULL,
	`total_quantity` int NOT NULL,
	`remaining_quantity` int NOT NULL,
	`display_order` int NOT NULL DEFAULT 0,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `draw_results` ADD CONSTRAINT `draw_results_event_id_events_id_fk` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `draw_results` ADD CONSTRAINT `draw_results_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_event_id_events_id_fk` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE cascade ON UPDATE no action;