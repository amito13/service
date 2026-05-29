CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"email" varchar(256) NOT NULL,
	"contact" varchar(13) NOT NULL,
	"password" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"city" varchar(256) NOT NULL,
	"state" varchar(256) NOT NULL,
	"pincode" varchar(10) NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
