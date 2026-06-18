CREATE TYPE "benefit_category" AS ENUM (
  'free_food',
  'discounted_food',
  'snap_accepted',
  'student_discount',
  'senior_discount',
  'kids_eat_free',
  'bogo',
  'coupon',
  'free_breakfast',
  'other'
);

CREATE TYPE "submission_status" AS ENUM (
  'pending',
  'approved',
  'rejected'
);

CREATE TYPE "edit_status" AS ENUM (
  'pending',
  'approved',
  'rejected'
);

CREATE TYPE "day_of_week" AS ENUM (
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
);

CREATE TABLE "users" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "username" text NOT NULL,
  "email" text UNIQUE NOT NULL,
  "created_at" timestamptz DEFAULT (now())
);

CREATE TABLE "owners" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "user_id" uuid NOT NULL,
  "resource_id" uuid NOT NULL,
  "verification_status" text NOT NULL DEFAULT 'pending',
  "verification_method" text,
  "verification_notes" text,
  "verified_at" timestamptz,
  "verified_by" uuid,
  "created_at" timestamptz DEFAULT (now())
);

CREATE TABLE "resources" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "name" text NOT NULL,
  "description" text,
  "offer_desc" text,
  "offer_source" text,
  "benefits" benefit_category[],
  "verification_status" submission_status DEFAULT 'pending',
  "expires_at" date,
  "is_active" boolean DEFAULT true,
  "created_by" uuid NOT NULL,
  "created_at" timestamptz DEFAULT (now()),
  "updated_at" timestamptz DEFAULT (now())
);

CREATE TABLE "physical_locations" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "resource_id" uuid NOT NULL,
  "address" text NOT NULL,
  "address2" text,
  "city" text NOT NULL,
  "state" text NOT NULL,
  "zip_code" text NOT NULL,
  "neighborhood" text,
  "latitude" float,
  "longitude" float,
  "phone_number" text,
  "verification_status" submission_status DEFAULT 'pending',
  "created_at" timestamptz DEFAULT (now())
);

CREATE TABLE "online_access" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "resource_id" uuid NOT NULL,
  "url" text NOT NULL,
  "instructions" text,
  "created_at" timestamptz DEFAULT (now())
);

CREATE TABLE "other_access" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "resource_id" uuid NOT NULL,
  "notes" text,
  "url" text,
  "created_at" timestamptz DEFAULT (now())
);

CREATE TABLE "resource_benefits" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "resource_id" uuid NOT NULL,
  "benefit" benefit_category NOT NULL,
  "notes" text
);

CREATE TABLE "resource_hours" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "physical_location_id" uuid NOT NULL,
  "day" day_of_week NOT NULL,
  "opens_at" time NOT NULL,
  "closes_at" time NOT NULL,
  "notes" text,
  "valid_from" date,
  "valid_until" date
);

CREATE TABLE "resource_eligibility" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "resource_id" uuid NOT NULL,
  "income_limit" text,
  "id_required" boolean DEFAULT false,
  "residency_required" boolean DEFAULT false,
  "referral_required" boolean DEFAULT false,
  "other_requirements" text,
  "notes" text
);

CREATE TABLE "verification_events" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "resource_id" uuid,
  "physical_location_id" uuid,
  "owner_id" uuid,
  "verified_at" timestamptz DEFAULT (now()),
  "verified_by" uuid,
  "method" text,
  "outcome" text,
  "notes" text
);

CREATE TABLE "community_notes" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "resource_id" uuid NOT NULL,
  "author_id" uuid NOT NULL,
  "body" text NOT NULL,
  "rating" smallint,
  "is_flagged" boolean DEFAULT false,
  "created_at" timestamptz DEFAULT (now())
);

CREATE TABLE "submissions" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "submitted_by" uuid NOT NULL,
  "status" submission_status NOT NULL DEFAULT 'pending',
  "reviewed_by" uuid,
  "name" text NOT NULL,
  "description" text,
  "benefits" benefit_category[],
  "access_notes" text,
  "created_at" timestamptz DEFAULT (now())
);

CREATE TABLE "edits" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "resource_id" uuid NOT NULL,
  "submitted_by" uuid NOT NULL,
  "status" edit_status NOT NULL DEFAULT 'pending',
  "reviewed_by" uuid,
  "field_name" text NOT NULL,
  "old_value" text,
  "new_value" text,
  "created_at" timestamptz DEFAULT (now())
);

CREATE TABLE "edit_history" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "resource_id" uuid NOT NULL,
  "edit_id" uuid,
  "changed_by" uuid NOT NULL,
  "approved_by" uuid,
  "field_name" text NOT NULL,
  "old_value" text,
  "new_value" text,
  "changed_at" timestamptz DEFAULT (now())
);

COMMENT ON COLUMN "owners"."verification_status" IS 'pending | verified | rejected';

COMMENT ON COLUMN "owners"."verification_method" IS 'phone | document | email_domain';

ALTER TABLE "owners" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "owners" ADD FOREIGN KEY ("resource_id") REFERENCES "resources" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "owners" ADD FOREIGN KEY ("verified_by") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "resources" ADD FOREIGN KEY ("created_by") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "physical_locations" ADD FOREIGN KEY ("resource_id") REFERENCES "resources" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "online_access" ADD FOREIGN KEY ("resource_id") REFERENCES "resources" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "other_access" ADD FOREIGN KEY ("resource_id") REFERENCES "resources" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "resource_benefits" ADD FOREIGN KEY ("resource_id") REFERENCES "resources" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "resource_hours" ADD FOREIGN KEY ("physical_location_id") REFERENCES "physical_locations" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "resource_eligibility" ADD FOREIGN KEY ("resource_id") REFERENCES "resources" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "verification_events" ADD FOREIGN KEY ("resource_id") REFERENCES "resources" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "verification_events" ADD FOREIGN KEY ("physical_location_id") REFERENCES "physical_locations" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "verification_events" ADD FOREIGN KEY ("owner_id") REFERENCES "owners" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "verification_events" ADD FOREIGN KEY ("verified_by") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "community_notes" ADD FOREIGN KEY ("resource_id") REFERENCES "resources" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "community_notes" ADD FOREIGN KEY ("author_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "submissions" ADD FOREIGN KEY ("submitted_by") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "submissions" ADD FOREIGN KEY ("reviewed_by") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "edits" ADD FOREIGN KEY ("resource_id") REFERENCES "resources" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "edits" ADD FOREIGN KEY ("submitted_by") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "edits" ADD FOREIGN KEY ("reviewed_by") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "edit_history" ADD FOREIGN KEY ("resource_id") REFERENCES "resources" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "edit_history" ADD FOREIGN KEY ("edit_id") REFERENCES "edits" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "edit_history" ADD FOREIGN KEY ("changed_by") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "edit_history" ADD FOREIGN KEY ("approved_by") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
