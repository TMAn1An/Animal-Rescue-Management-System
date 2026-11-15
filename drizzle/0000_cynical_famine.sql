CREATE TABLE `reporters` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `reporters_phone_unique` ON `reporters` (`phone`);--> statement-breakpoint
CREATE TABLE `request_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`request_id` integer NOT NULL,
	`type` text NOT NULL,
	`message` text,
	`actor_id` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`request_id`) REFERENCES `requests`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`actor_id`) REFERENCES `staff`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `events_request_idx` ON `request_events` (`request_id`);--> statement-breakpoint
CREATE TABLE `requests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`reporter_id` integer NOT NULL,
	`rescuer_id` integer,
	`pet_type` text NOT NULL,
	`condition` text NOT NULL,
	`area` text NOT NULL,
	`address` text NOT NULL,
	`description` text NOT NULL,
	`note` text,
	`donation_amount` real,
	`status` text DEFAULT 'pending' NOT NULL,
	`eta` integer,
	`assigned_at` integer,
	`completed_at` integer,
	`outcome` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`reporter_id`) REFERENCES `reporters`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`rescuer_id`) REFERENCES `rescuers`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `requests_code_unique` ON `requests` (`code`);--> statement-breakpoint
CREATE INDEX `requests_status_idx` ON `requests` (`status`);--> statement-breakpoint
CREATE INDEX `requests_reporter_idx` ON `requests` (`reporter_id`);--> statement-breakpoint
CREATE INDEX `requests_rescuer_idx` ON `requests` (`rescuer_id`);--> statement-breakpoint
CREATE INDEX `requests_created_idx` ON `requests` (`created_at`);--> statement-breakpoint
CREATE TABLE `rescuers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`nid` text,
	`area` text,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `staff` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`password_hash` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `staff_email_unique` ON `staff` (`email`);