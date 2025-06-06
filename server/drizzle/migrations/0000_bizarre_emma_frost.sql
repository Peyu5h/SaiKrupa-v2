CREATE TABLE `customers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`address` text NOT NULL,
	`phone` text NOT NULL,
	`std_id` text,
	`customer_id` text NOT NULL,
	`register_at` text,
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `customers_customer_id_unique` ON `customers` (`customer_id`);--> statement-breakpoint
CREATE TABLE `month_payments` (
	`id` text PRIMARY KEY NOT NULL,
	`payment_id` text NOT NULL,
	`month` integer NOT NULL,
	`amount` real NOT NULL,
	`paid_via` text,
	`debt` real DEFAULT 0 NOT NULL,
	`advance` real DEFAULT 0 NOT NULL,
	`payment_date` integer,
	`status` text DEFAULT 'Unpaid' NOT NULL,
	`note` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_id` text NOT NULL,
	`year` integer NOT NULL,
	`total_debt` real DEFAULT 0 NOT NULL,
	`total_advance` real DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `plans` (
	`id` text PRIMARY KEY NOT NULL,
	`amount` integer NOT NULL,
	`profit` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_id` text NOT NULL,
	`payment_id` text,
	`month_payment_id` text,
	`amount` real NOT NULL,
	`type` text NOT NULL,
	`note` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`month_payment_id`) REFERENCES `month_payments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`username` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);