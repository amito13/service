CREATE TYPE "public"."account_type" AS ENUM('USER', 'PROFESSIONAL', 'ADMIN');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "account_type" "account_type" DEFAULT 'USER' NOT NULL;