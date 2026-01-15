CREATE TABLE `payment_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` datetime,
	`slug` varchar(100) NOT NULL,
	`display_name` varchar(255) NOT NULL,
	`description` text,
	`logo_url` varchar(500),
	`bank_code` varchar(20) NOT NULL,
	`account_number` varchar(50) NOT NULL,
	`account_holder` varchar(100) NOT NULL,
	`primary_color` varchar(7) NOT NULL DEFAULT '#3B82F6',
	`background_color` varchar(7) NOT NULL DEFAULT '#F8FAFC',
	`is_active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `payment_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `payment_accounts_slug_unique` UNIQUE(`slug`)
);
