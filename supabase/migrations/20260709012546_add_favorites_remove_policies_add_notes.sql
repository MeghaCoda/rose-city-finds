


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";








ALTER SCHEMA "public" OWNER TO "postgres";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."benefit_category" AS ENUM (
    'free_food',
    'discounted_food',
    'snap_accepted',
    'student_discount',
    'senior_discount',
    'kids_eat_free',
    'bogo',
    'coupon',
    'free_breakfast',
    'other',
    'military_discount',
    'everyone'
);


ALTER TYPE "public"."benefit_category" OWNER TO "postgres";


CREATE TYPE "public"."day_of_week" AS ENUM (
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday'
);


ALTER TYPE "public"."day_of_week" OWNER TO "postgres";


CREATE TYPE "public"."edit_status" AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE "public"."edit_status" OWNER TO "postgres";


CREATE TYPE "public"."verification_outcome" AS ENUM (
    'verified',
    'rejected'
);


ALTER TYPE "public"."verification_outcome" OWNER TO "postgres";


CREATE TYPE "public"."verification_status" AS ENUM (
    'pending',
    'verified',
    'rejected'
);


ALTER TYPE "public"."verification_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."current_user_role"() RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  select auth.jwt() -> 'app_metadata' ->> 'role';
$$;


ALTER FUNCTION "public"."current_user_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
begin
  insert into public.users (id, email, username)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  select (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin';
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."community_notes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "resource_id" "uuid" NOT NULL,
    "author_id" "uuid" NOT NULL,
    "body" "text" NOT NULL,
    "rating" smallint,
    "is_flagged" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."community_notes" OWNER TO "postgres";


COMMENT ON TABLE "public"."community_notes" IS 'DORMANT (v1): not wired into any UI yet, INSERT is admin-only and the self-delete-own-note policy has been removed. Explored as a rating/review mechanism, judged insufficient for a real public reviews feature (no moderation lifecycle, no edit history, no helpfulness voting, no resource-vs-location target split). Consider a dedicated reviews table for v2 instead.';



CREATE TABLE IF NOT EXISTS "public"."edit_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "resource_id" "uuid" NOT NULL,
    "edit_id" "uuid",
    "changed_by" "uuid" NOT NULL,
    "approved_by" "uuid",
    "field_name" "text" NOT NULL,
    "old_value" "text",
    "new_value" "text",
    "changed_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."edit_history" OWNER TO "postgres";


COMMENT ON TABLE "public"."edit_history" IS 'DORMANT (v1): audit log for pending_edits approvals/rejections. No producer until pending_edits goes live.';



CREATE TABLE IF NOT EXISTS "public"."favorites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "resource_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."favorites" OWNER TO "postgres";


COMMENT ON TABLE "public"."favorites" IS 'DORMANT (v1): not wired into any UI yet. INSERT/UPDATE/DELETE are admin-only; users can still SELECT their own favorites and admins can SELECT all. Revisit when user-facing favoriting is actually built.';



CREATE TABLE IF NOT EXISTS "public"."online_access" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "resource_id" "uuid" NOT NULL,
    "url" "text" NOT NULL,
    "instructions" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."online_access" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."other_access" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "resource_id" "uuid" NOT NULL,
    "notes" "text",
    "url" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."other_access" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pending_edits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "resource_id" "uuid" NOT NULL,
    "submitted_by" "uuid" NOT NULL,
    "status" "public"."edit_status" DEFAULT 'pending'::"public"."edit_status" NOT NULL,
    "reviewed_by" "uuid",
    "field_name" "text" NOT NULL,
    "old_value" "text",
    "new_value" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."pending_edits" OWNER TO "postgres";


COMMENT ON TABLE "public"."pending_edits" IS 'DORMANT (v1): not wired into any UI yet, INSERT is admin-only. Needs batch_id for multi-field edits, target_table/target_id polymorphism to support editing physical_locations, and a field_name allow-list before public use.';



CREATE TABLE IF NOT EXISTS "public"."physical_locations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "resource_id" "uuid" NOT NULL,
    "address" "text" NOT NULL,
    "address2" "text",
    "city" "text" NOT NULL,
    "state" "text" NOT NULL,
    "zip_code" "text" NOT NULL,
    "neighborhood" "text",
    "latitude" double precision NOT NULL,
    "longitude" double precision NOT NULL,
    "phone_number" "text",
    "verification_status" "public"."verification_status" DEFAULT 'pending'::"public"."verification_status",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "notes" "text",
    "created_by" "uuid"
);


ALTER TABLE "public"."physical_locations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."resource_benefits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "resource_id" "uuid" NOT NULL,
    "benefit" "public"."benefit_category" NOT NULL,
    "notes" "text"
);


ALTER TABLE "public"."resource_benefits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."resource_eligibility" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "resource_id" "uuid" NOT NULL,
    "income_limit" "text",
    "id_required" boolean DEFAULT false,
    "residency_required" boolean DEFAULT false,
    "referral_required" boolean DEFAULT false,
    "other_requirements" "text",
    "notes" "text"
);


ALTER TABLE "public"."resource_eligibility" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."resource_hours" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "physical_location_id" "uuid" NOT NULL,
    "day" "public"."day_of_week" NOT NULL,
    "opens_at" time without time zone NOT NULL,
    "closes_at" time without time zone NOT NULL,
    "notes" "text",
    "valid_from" "date",
    "valid_until" "date"
);


ALTER TABLE "public"."resource_hours" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."resources" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "offer_desc" "text",
    "offer_source" "text",
    "benefits" "public"."benefit_category"[],
    "verification_status" "public"."verification_status" DEFAULT 'pending'::"public"."verification_status",
    "expires_at" "date",
    "is_active" boolean DEFAULT true,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "notes" "text",
    "proof_required" boolean DEFAULT false NOT NULL,
    CONSTRAINT "no_proof_when_everyone" CHECK ((NOT (('everyone'::"public"."benefit_category" = ANY ("benefits")) AND "proof_required")))
);


ALTER TABLE "public"."resources" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."submissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "submitted_by" "uuid" NOT NULL,
    "status" "public"."verification_status" DEFAULT 'pending'::"public"."verification_status" NOT NULL,
    "reviewed_by" "uuid",
    "name" "text" NOT NULL,
    "description" "text",
    "benefits" "public"."benefit_category"[],
    "access_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."submissions" OWNER TO "postgres";


COMMENT ON TABLE "public"."submissions" IS 'DORMANT (v1): not wired into any UI yet, INSERT is admin-only. Alternate path for proposing new resources; overlaps with resources/pending_edits. Needs design decision before v2 launch.';



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "username" "text" NOT NULL,
    "email" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."verification_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "resource_id" "uuid",
    "physical_location_id" "uuid",
    "verified_at" timestamp with time zone DEFAULT "now"(),
    "verified_by" "uuid",
    "method" "text",
    "outcome" "public"."verification_outcome" NOT NULL,
    "notes" "text"
);


ALTER TABLE "public"."verification_events" OWNER TO "postgres";


ALTER TABLE ONLY "public"."community_notes"
    ADD CONSTRAINT "community_notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."edit_history"
    ADD CONSTRAINT "edit_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_user_resource_unique" UNIQUE ("user_id", "resource_id");



ALTER TABLE ONLY "public"."online_access"
    ADD CONSTRAINT "online_access_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."other_access"
    ADD CONSTRAINT "other_access_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pending_edits"
    ADD CONSTRAINT "pending_edits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."physical_locations"
    ADD CONSTRAINT "physical_locations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."resource_benefits"
    ADD CONSTRAINT "resource_benefits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."resource_eligibility"
    ADD CONSTRAINT "resource_eligibility_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."resource_hours"
    ADD CONSTRAINT "resource_hours_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."resources"
    ADD CONSTRAINT "resources_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."submissions"
    ADD CONSTRAINT "submissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE DEFERRABLE;



ALTER TABLE ONLY "public"."verification_events"
    ADD CONSTRAINT "verification_events_pkey" PRIMARY KEY ("id");


ALTER TABLE ONLY "public"."verification_events"
    ADD CONSTRAINT "verification_events_target_xor" CHECK ("num_nonnulls"("resource_id", "physical_location_id") = 1);



CREATE UNIQUE INDEX "physical_locations_address_unique" ON "public"."physical_locations" USING "btree" ("lower"("address"), "lower"(COALESCE("address2", ''::"text")), "lower"("city"), "lower"("state"), "lower"("zip_code"));



CREATE UNIQUE INDEX "resources_name_unique" ON "public"."resources" USING "btree" ("lower"("name"));



ALTER TABLE ONLY "public"."community_notes"
    ADD CONSTRAINT "community_notes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") DEFERRABLE;



ALTER TABLE ONLY "public"."community_notes"
    ADD CONSTRAINT "community_notes_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") DEFERRABLE;



ALTER TABLE ONLY "public"."edit_history"
    ADD CONSTRAINT "edit_history_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") DEFERRABLE;



ALTER TABLE ONLY "public"."edit_history"
    ADD CONSTRAINT "edit_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") DEFERRABLE;



ALTER TABLE ONLY "public"."edit_history"
    ADD CONSTRAINT "edit_history_edit_id_fkey" FOREIGN KEY ("edit_id") REFERENCES "public"."pending_edits"("id") DEFERRABLE;



ALTER TABLE ONLY "public"."edit_history"
    ADD CONSTRAINT "edit_history_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") DEFERRABLE;



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") DEFERRABLE;



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE DEFERRABLE;



ALTER TABLE ONLY "public"."online_access"
    ADD CONSTRAINT "online_access_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") DEFERRABLE;



ALTER TABLE ONLY "public"."other_access"
    ADD CONSTRAINT "other_access_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") DEFERRABLE;



ALTER TABLE ONLY "public"."pending_edits"
    ADD CONSTRAINT "pending_edits_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") DEFERRABLE;



ALTER TABLE ONLY "public"."pending_edits"
    ADD CONSTRAINT "pending_edits_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") DEFERRABLE;



ALTER TABLE ONLY "public"."pending_edits"
    ADD CONSTRAINT "pending_edits_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") DEFERRABLE;



ALTER TABLE ONLY "public"."physical_locations"
    ADD CONSTRAINT "physical_locations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL DEFERRABLE;



ALTER TABLE ONLY "public"."physical_locations"
    ADD CONSTRAINT "physical_locations_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") DEFERRABLE;



ALTER TABLE ONLY "public"."resource_benefits"
    ADD CONSTRAINT "resource_benefits_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") DEFERRABLE;



ALTER TABLE ONLY "public"."resource_eligibility"
    ADD CONSTRAINT "resource_eligibility_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") DEFERRABLE;



ALTER TABLE ONLY "public"."resource_hours"
    ADD CONSTRAINT "resource_hours_physical_location_id_fkey" FOREIGN KEY ("physical_location_id") REFERENCES "public"."physical_locations"("id") DEFERRABLE;



ALTER TABLE ONLY "public"."resources"
    ADD CONSTRAINT "resources_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL DEFERRABLE;



ALTER TABLE ONLY "public"."submissions"
    ADD CONSTRAINT "submissions_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") DEFERRABLE;



ALTER TABLE ONLY "public"."submissions"
    ADD CONSTRAINT "submissions_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") DEFERRABLE;



ALTER TABLE ONLY "public"."verification_events"
    ADD CONSTRAINT "verification_events_physical_location_id_fkey" FOREIGN KEY ("physical_location_id") REFERENCES "public"."physical_locations"("id") DEFERRABLE;



ALTER TABLE ONLY "public"."verification_events"
    ADD CONSTRAINT "verification_events_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") DEFERRABLE;



ALTER TABLE ONLY "public"."verification_events"
    ADD CONSTRAINT "verification_events_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") DEFERRABLE;



CREATE POLICY "Admins can add benefits" ON "public"."resource_benefits" FOR INSERT WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can add eligibility" ON "public"."resource_eligibility" FOR INSERT WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can add favorites" ON "public"."favorites" FOR INSERT WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can add hours" ON "public"."resource_hours" FOR INSERT WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can add locations" ON "public"."physical_locations" FOR INSERT WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can add notes" ON "public"."community_notes" FOR INSERT WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can add online access" ON "public"."online_access" FOR INSERT WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can add other access" ON "public"."other_access" FOR INSERT WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can add pending edits" ON "public"."pending_edits" FOR INSERT WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can add resources" ON "public"."resources" FOR INSERT WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can add submissions" ON "public"."submissions" FOR INSERT WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can delete any note" ON "public"."community_notes" FOR DELETE USING ("public"."is_admin"());



CREATE POLICY "Admins can delete benefits" ON "public"."resource_benefits" FOR DELETE USING ("public"."is_admin"());



CREATE POLICY "Admins can delete eligibility" ON "public"."resource_eligibility" FOR DELETE USING ("public"."is_admin"());



CREATE POLICY "Admins can delete hours" ON "public"."resource_hours" FOR DELETE USING ("public"."is_admin"());



CREATE POLICY "Admins can delete locations" ON "public"."physical_locations" FOR DELETE USING ("public"."is_admin"());



CREATE POLICY "Admins can delete online access" ON "public"."online_access" FOR DELETE USING ("public"."is_admin"());



CREATE POLICY "Admins can delete other access" ON "public"."other_access" FOR DELETE USING ("public"."is_admin"());



CREATE POLICY "Admins can delete resources" ON "public"."resources" FOR DELETE USING ("public"."is_admin"());



CREATE POLICY "Admins can insert edit history" ON "public"."edit_history" FOR INSERT WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can manage verification events" ON "public"."verification_events" USING ("public"."is_admin"());



CREATE POLICY "Admins can remove favorites" ON "public"."favorites" FOR DELETE USING ("public"."is_admin"());



CREATE POLICY "Admins can update benefits" ON "public"."resource_benefits" FOR UPDATE USING ("public"."is_admin"());



CREATE POLICY "Admins can update eligibility" ON "public"."resource_eligibility" FOR UPDATE USING ("public"."is_admin"());



CREATE POLICY "Admins can update favorites" ON "public"."favorites" FOR UPDATE USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());



CREATE POLICY "Admins can update hours" ON "public"."resource_hours" FOR UPDATE USING ("public"."is_admin"());



CREATE POLICY "Admins can update locations" ON "public"."physical_locations" FOR UPDATE USING ("public"."is_admin"());



CREATE POLICY "Admins can update online access" ON "public"."online_access" FOR UPDATE USING ("public"."is_admin"());



CREATE POLICY "Admins can update other access" ON "public"."other_access" FOR UPDATE USING ("public"."is_admin"());



CREATE POLICY "Admins can update pending edits" ON "public"."pending_edits" FOR UPDATE USING ("public"."is_admin"());



CREATE POLICY "Admins can update resources" ON "public"."resources" FOR UPDATE USING ("public"."is_admin"());



CREATE POLICY "Admins can update submissions" ON "public"."submissions" FOR UPDATE USING ("public"."is_admin"());



CREATE POLICY "Admins can view all benefits" ON "public"."resource_benefits" FOR SELECT USING ("public"."is_admin"());



CREATE POLICY "Admins can view all edit history" ON "public"."edit_history" FOR SELECT USING ("public"."is_admin"());



CREATE POLICY "Admins can view all eligibility" ON "public"."resource_eligibility" FOR SELECT USING ("public"."is_admin"());



CREATE POLICY "Admins can view all favorites" ON "public"."favorites" FOR SELECT USING ("public"."is_admin"());



CREATE POLICY "Admins can view all hours" ON "public"."resource_hours" FOR SELECT USING ("public"."is_admin"());



CREATE POLICY "Admins can view all locations" ON "public"."physical_locations" FOR SELECT USING ("public"."is_admin"());



CREATE POLICY "Admins can view all online access" ON "public"."online_access" FOR SELECT USING ("public"."is_admin"());



CREATE POLICY "Admins can view all other access" ON "public"."other_access" FOR SELECT USING ("public"."is_admin"());



CREATE POLICY "Admins can view all pending edits" ON "public"."pending_edits" FOR SELECT USING ("public"."is_admin"());



CREATE POLICY "Admins can view all resources" ON "public"."resources" FOR SELECT USING ("public"."is_admin"());



CREATE POLICY "Admins can view all submissions" ON "public"."submissions" FOR SELECT USING ("public"."is_admin"());



CREATE POLICY "Admins can view all users" ON "public"."users" FOR SELECT USING ("public"."is_admin"());



CREATE POLICY "Public can view benefits for verified resources" ON "public"."resource_benefits" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."resources" "r"
  WHERE (("r"."id" = "resource_benefits"."resource_id") AND ("r"."verification_status" = 'verified'::"public"."verification_status") AND ("r"."is_active" = true)))));



CREATE POLICY "Public can view edit history for verified resources" ON "public"."edit_history" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."resources" "r"
  WHERE (("r"."id" = "edit_history"."resource_id") AND ("r"."verification_status" = 'verified'::"public"."verification_status")))));



CREATE POLICY "Public can view eligibility for verified resources" ON "public"."resource_eligibility" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."resources" "r"
  WHERE (("r"."id" = "resource_eligibility"."resource_id") AND ("r"."verification_status" = 'verified'::"public"."verification_status") AND ("r"."is_active" = true)))));



CREATE POLICY "Public can view hours for verified locations" ON "public"."resource_hours" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."physical_locations" "pl"
     JOIN "public"."resources" "r" ON (("r"."id" = "pl"."resource_id")))
  WHERE (("pl"."id" = "resource_hours"."physical_location_id") AND ("r"."verification_status" = 'verified'::"public"."verification_status") AND ("r"."is_active" = true)))));



CREATE POLICY "Public can view notes on verified resources" ON "public"."community_notes" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."resources" "r"
  WHERE (("r"."id" = "community_notes"."resource_id") AND ("r"."verification_status" = 'verified'::"public"."verification_status") AND ("r"."is_active" = true)))));



CREATE POLICY "Public can view online access for verified resources" ON "public"."online_access" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."resources" "r"
  WHERE (("r"."id" = "online_access"."resource_id") AND ("r"."verification_status" = 'verified'::"public"."verification_status") AND ("r"."is_active" = true)))));



CREATE POLICY "Public can view other access for verified resources" ON "public"."other_access" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."resources" "r"
  WHERE (("r"."id" = "other_access"."resource_id") AND ("r"."verification_status" = 'verified'::"public"."verification_status") AND ("r"."is_active" = true)))));



CREATE POLICY "Public can view verified locations" ON "public"."physical_locations" FOR SELECT USING ((("verification_status" = 'verified'::"public"."verification_status") AND (EXISTS ( SELECT 1
   FROM "public"."resources" "r"
  WHERE (("r"."id" = "physical_locations"."resource_id") AND ("r"."verification_status" = 'verified'::"public"."verification_status") AND ("r"."is_active" = true))))));



CREATE POLICY "Public can view verified resources" ON "public"."resources" FOR SELECT USING ((("verification_status" = 'verified'::"public"."verification_status") AND ("is_active" = true)));



CREATE POLICY "Users can update their own profile" ON "public"."users" FOR UPDATE TO "authenticated" USING (("id" = "auth"."uid"()));



CREATE POLICY "Users can view their own favorites" ON "public"."favorites" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own pending edits" ON "public"."pending_edits" FOR SELECT TO "authenticated" USING (("submitted_by" = "auth"."uid"()));



CREATE POLICY "Users can view their own profile" ON "public"."users" FOR SELECT TO "authenticated" USING (("id" = "auth"."uid"()));



CREATE POLICY "Users can view their own submissions" ON "public"."submissions" FOR SELECT TO "authenticated" USING (("submitted_by" = "auth"."uid"()));



ALTER TABLE "public"."community_notes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."edit_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."favorites" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."online_access" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."other_access" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pending_edits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."physical_locations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."resource_benefits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."resource_eligibility" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."resource_hours" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."resources" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."submissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."verification_events" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";











































































































































































GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."community_notes" TO "anon";
GRANT ALL ON TABLE "public"."community_notes" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."community_notes" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."edit_history" TO "anon";
GRANT ALL ON TABLE "public"."edit_history" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."edit_history" TO "service_role";



GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."favorites" TO "anon";
GRANT ALL ON TABLE "public"."favorites" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."favorites" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."online_access" TO "anon";
GRANT ALL ON TABLE "public"."online_access" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."online_access" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."other_access" TO "anon";
GRANT ALL ON TABLE "public"."other_access" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."other_access" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."pending_edits" TO "anon";
GRANT ALL ON TABLE "public"."pending_edits" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."pending_edits" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."physical_locations" TO "anon";
GRANT ALL ON TABLE "public"."physical_locations" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."physical_locations" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."resource_benefits" TO "anon";
GRANT ALL ON TABLE "public"."resource_benefits" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."resource_benefits" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."resource_eligibility" TO "anon";
GRANT ALL ON TABLE "public"."resource_eligibility" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."resource_eligibility" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."resource_hours" TO "anon";
GRANT ALL ON TABLE "public"."resource_hours" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."resource_hours" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."resources" TO "anon";
GRANT ALL ON TABLE "public"."resources" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."resources" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."submissions" TO "anon";
GRANT ALL ON TABLE "public"."submissions" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."submissions" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."users" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."verification_events" TO "anon";
GRANT ALL ON TABLE "public"."verification_events" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."verification_events" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT UPDATE ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT UPDATE ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT UPDATE ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO "service_role";
































--
-- Dumped schema changes for auth and storage
--

CREATE OR REPLACE TRIGGER "on_auth_user_created" AFTER INSERT ON "auth"."users" FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_user"();

RESET search_path;



