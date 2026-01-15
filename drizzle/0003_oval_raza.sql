ALTER TABLE `payment_accounts` DROP FOREIGN KEY `payment_accounts_event_id_events_id_fk`;
--> statement-breakpoint
ALTER TABLE `payment_accounts` DROP COLUMN `event_id`;