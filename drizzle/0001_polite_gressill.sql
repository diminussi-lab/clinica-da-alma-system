CREATE TABLE `appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`therapistId` int NOT NULL,
	`appointmentDate` timestamp NOT NULL,
	`duration` int DEFAULT 60,
	`status` enum('scheduled','completed','cancelled','no-show') DEFAULT 'scheduled',
	`notes` text,
	`reminderSent` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audio_files` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int,
	`therapistId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`audioUrl` text NOT NULL,
	`audioKey` varchar(255) NOT NULL,
	`duration` int,
	`fileType` varchar(50),
	`fileSize` int,
	`audioType` enum('meditation','session_recording','personal_note','other') DEFAULT 'other',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `audio_files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `client_meditations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`meditationId` int NOT NULL,
	`recommendedDate` timestamp DEFAULT (now()),
	`completed` boolean DEFAULT false,
	`completedDate` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `client_meditations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`therapistId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320),
	`phone` varchar(20),
	`dateOfBirth` date,
	`address` text,
	`city` varchar(100),
	`state` varchar(2),
	`zipCode` varchar(10),
	`emergencyContact` varchar(255),
	`emergencyPhone` varchar(20),
	`notes` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emotional_evolution` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`therapistId` int NOT NULL,
	`recordDate` date NOT NULL,
	`emotionalState` int,
	`anxiety` int,
	`depression` int,
	`wellbeing` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `emotional_evolution_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `financial_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`therapistId` int NOT NULL,
	`sessionId` int,
	`amount` decimal(10,2) NOT NULL,
	`description` varchar(255),
	`recordType` enum('income','expense') DEFAULT 'income',
	`paymentMethod` varchar(100),
	`recordDate` date NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `financial_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meditations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`therapistId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`audioUrl` text NOT NULL,
	`audioKey` varchar(255) NOT NULL,
	`duration` int,
	`category` varchar(100),
	`difficulty` enum('beginner','intermediate','advanced') DEFAULT 'beginner',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `meditations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `protocols` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`therapistId` int NOT NULL,
	`protocolName` varchar(255) NOT NULL,
	`description` text,
	`steps` text,
	`frequency` varchar(100),
	`duration` varchar(100),
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `protocols_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`therapistId` int NOT NULL,
	`sessionDate` timestamp NOT NULL,
	`duration` int,
	`sessionNotes` text,
	`emotionalState` varchar(100),
	`techniques` text,
	`sessionType` enum('individual','group','online') DEFAULT 'individual',
	`price` decimal(10,2),
	`paid` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `therapeutic_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`clientId` int NOT NULL,
	`therapistId` int NOT NULL,
	`mainComplaint` text,
	`medicalHistory` text,
	`emotionalBlockages` text,
	`personalGoals` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `therapeutic_records_id` PRIMARY KEY(`id`)
);
