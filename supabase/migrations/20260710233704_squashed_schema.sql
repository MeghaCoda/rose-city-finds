


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


CREATE TYPE "public"."eligibility_type" AS ENUM (
    'anyone',
    'student',
    'senior',
    'kids',
    'military',
    'snap',
    'income_requirement',
    'other'
);


ALTER TYPE "public"."eligibility_type" OWNER TO "postgres";


CREATE TYPE "public"."food_format" AS ENUM (
    'dine_in',
    'grocery',
    'pickup',
    'delivery'
);


ALTER TYPE "public"."food_format" OWNER TO "postgres";


CREATE TYPE "public"."price_type" AS ENUM (
    'free',
    'discount'
);


ALTER TYPE "public"."price_type" OWNER TO "postgres";


CREATE TYPE "public"."venue_type" AS ENUM (
    'food_pantry',
    'food_bank',
    'restaurant',
    'cafe',
    'grocery_store',
    'farmers_market',
    'community_organization',
    'other'
);


ALTER TYPE "public"."venue_type" OWNER TO "postgres";


CREATE TYPE "public"."verification_outcome" AS ENUM (
    'verified',
    'rejected',
    'delisted'
);


ALTER TYPE "public"."verification_outcome" OWNER TO "postgres";


CREATE TYPE "public"."verification_status" AS ENUM (
    'pending',
    'verified',
    'rejected',
    'delisted'
);


ALTER TYPE "public"."verification_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."deactivate_current_user"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
begin
  update public.users
  set is_active = false,
      deactivated_at = now(),
      email = 'deleted-' || "id"::text || '@deleted.rosecityfinds.invalid',
      username = 'deleted-user-' || left("id"::text, 8)
  where id = auth.uid()
    and is_active = true;
end;
$$;


ALTER FUNCTION "public"."deactivate_current_user"() OWNER TO "postgres";


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
    LANGUAGE "sql" STABLE
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
  select (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin';
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_verification_status_changed_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  IF NEW."verification_status" IS DISTINCT FROM OLD."verification_status" THEN
    NEW."verification_status_changed_at" = now();
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."set_verification_status_changed_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."businesses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "venue_type" "public"."venue_type" NOT NULL,
    "verification_status" "public"."verification_status" DEFAULT 'pending'::"public"."verification_status" NOT NULL,
    "verification_status_changed_at" timestamp with time zone,
    "verification_expires_at" "date",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "notes" "text"
);


ALTER TABLE "public"."businesses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."location_hours" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "location_id" "uuid" NOT NULL,
    "day" "public"."day_of_week" NOT NULL,
    "opens_at" time without time zone NOT NULL,
    "closes_at" time without time zone NOT NULL,
    "notes" "text",
    "valid_from" "date",
    "valid_until" "date"
);


ALTER TABLE "public"."location_hours" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."locations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "business_id" "uuid" NOT NULL,
    "address" "text" NOT NULL,
    "address2" "text",
    "city" "text" NOT NULL,
    "state" "text" NOT NULL,
    "zip_code" "text" NOT NULL,
    "neighborhood" "text",
    "latitude" double precision NOT NULL,
    "longitude" double precision NOT NULL,
    "phone_number" "text",
    "food_formats" "public"."food_format"[] DEFAULT '{}'::"public"."food_format"[] NOT NULL,
    "verification_status" "public"."verification_status" DEFAULT 'pending'::"public"."verification_status" NOT NULL,
    "verification_status_changed_at" timestamp with time zone,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "notes" "text"
);


ALTER TABLE "public"."locations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."offer_hours" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "offer_id" "uuid" NOT NULL,
    "day" "public"."day_of_week" NOT NULL,
    "opens_at" time without time zone NOT NULL,
    "closes_at" time without time zone NOT NULL,
    "notes" "text",
    "valid_from" "date",
    "valid_until" "date"
);


ALTER TABLE "public"."offer_hours" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."offer_locations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "offer_id" "uuid" NOT NULL,
    "location_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."offer_locations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."offers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "business_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "price_type" "public"."price_type"[] NOT NULL,
    "eligibility" "public"."eligibility_type"[] NOT NULL,
    "proof_required" boolean DEFAULT false NOT NULL,
    "proof_desc" "text",
    "expires_at" "date",
    "is_seasonal" boolean DEFAULT false NOT NULL,
    "season_start_date" "date",
    "season_end_date" "date",
    "is_active" boolean DEFAULT true NOT NULL,
    "verification_status" "public"."verification_status" DEFAULT 'pending'::"public"."verification_status" NOT NULL,
    "verification_status_changed_at" timestamp with time zone,
    "verification_expires_at" "date",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "notes" "text",
    CONSTRAINT "no_proof_when_anyone" CHECK ((NOT (('anyone'::"public"."eligibility_type" = ANY ("eligibility")) AND "proof_required"))),
    CONSTRAINT "seasonal_dates_required" CHECK (((NOT "is_seasonal") OR (("season_start_date" IS NOT NULL) AND ("season_end_date" IS NOT NULL) AND ("season_end_date" >= "season_start_date"))))
);


ALTER TABLE "public"."offers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "username" "text" NOT NULL,
    "email" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "is_active" boolean DEFAULT true NOT NULL,
    "deactivated_at" timestamp with time zone
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."verification_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "verified_at" timestamp with time zone DEFAULT "now"(),
    "verified_by" "uuid",
    "method" "text",
    "outcome" "public"."verification_outcome" NOT NULL,
    "notes" "text",
    "business_id" "uuid",
    "offer_id" "uuid",
    "location_id" "uuid",
    CONSTRAINT "verification_events_target_xor" CHECK (("num_nonnulls"("business_id", "offer_id", "location_id") = 1))
);


ALTER TABLE "public"."verification_events" OWNER TO "postgres";


ALTER TABLE ONLY "public"."businesses"
    ADD CONSTRAINT "businesses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."location_hours"
    ADD CONSTRAINT "location_hours_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."locations"
    ADD CONSTRAINT "locations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."offer_hours"
    ADD CONSTRAINT "offer_hours_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."offer_locations"
    ADD CONSTRAINT "offer_locations_offer_id_location_id_key" UNIQUE ("offer_id", "location_id");



ALTER TABLE ONLY "public"."offer_locations"
    ADD CONSTRAINT "offer_locations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."offers"
    ADD CONSTRAINT "offers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."verification_events"
    ADD CONSTRAINT "verification_events_pkey" PRIMARY KEY ("id");



CREATE UNIQUE INDEX "businesses_name_unique" ON "public"."businesses" USING "btree" ("lower"("name"));



CREATE INDEX "idx_location_hours_location_id" ON "public"."location_hours" USING "btree" ("location_id");



CREATE INDEX "idx_locations_business_id" ON "public"."locations" USING "btree" ("business_id");



CREATE INDEX "idx_offer_hours_offer_id" ON "public"."offer_hours" USING "btree" ("offer_id");



CREATE INDEX "idx_offer_locations_location_id" ON "public"."offer_locations" USING "btree" ("location_id");



CREATE INDEX "idx_offer_locations_offer_id" ON "public"."offer_locations" USING "btree" ("offer_id");



CREATE INDEX "idx_offers_business_id" ON "public"."offers" USING "btree" ("business_id");



CREATE INDEX "idx_verification_events_business_id" ON "public"."verification_events" USING "btree" ("business_id");



CREATE INDEX "idx_verification_events_offer_id" ON "public"."verification_events" USING "btree" ("offer_id");



CREATE INDEX "idx_verification_events_verified_by" ON "public"."verification_events" USING "btree" ("verified_by");



CREATE UNIQUE INDEX "locations_address_unique" ON "public"."locations" USING "btree" ("lower"("address"), "lower"(COALESCE("address2", ''::"text")), "lower"("city"), "lower"("state"), "lower"("zip_code"));



CREATE OR REPLACE TRIGGER "businesses_set_updated_at" BEFORE UPDATE ON "public"."businesses" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "businesses_set_verification_status_changed_at" BEFORE UPDATE ON "public"."businesses" FOR EACH ROW EXECUTE FUNCTION "public"."set_verification_status_changed_at"();



CREATE OR REPLACE TRIGGER "locations_set_verification_status_changed_at" BEFORE UPDATE ON "public"."locations" FOR EACH ROW EXECUTE FUNCTION "public"."set_verification_status_changed_at"();



CREATE OR REPLACE TRIGGER "offers_set_updated_at" BEFORE UPDATE ON "public"."offers" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "offers_set_verification_status_changed_at" BEFORE UPDATE ON "public"."offers" FOR EACH ROW EXECUTE FUNCTION "public"."set_verification_status_changed_at"();



ALTER TABLE ONLY "public"."businesses"
    ADD CONSTRAINT "businesses_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."location_hours"
    ADD CONSTRAINT "location_hours_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id");



ALTER TABLE ONLY "public"."locations"
    ADD CONSTRAINT "locations_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id");



ALTER TABLE ONLY "public"."locations"
    ADD CONSTRAINT "locations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."offer_hours"
    ADD CONSTRAINT "offer_hours_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id");



ALTER TABLE ONLY "public"."offer_locations"
    ADD CONSTRAINT "offer_locations_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id");



ALTER TABLE ONLY "public"."offer_locations"
    ADD CONSTRAINT "offer_locations_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id");



ALTER TABLE ONLY "public"."offers"
    ADD CONSTRAINT "offers_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id");



ALTER TABLE ONLY "public"."offers"
    ADD CONSTRAINT "offers_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE DEFERRABLE;



ALTER TABLE ONLY "public"."verification_events"
    ADD CONSTRAINT "verification_events_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id");



ALTER TABLE ONLY "public"."verification_events"
    ADD CONSTRAINT "verification_events_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id");



ALTER TABLE ONLY "public"."verification_events"
    ADD CONSTRAINT "verification_events_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id");



ALTER TABLE ONLY "public"."verification_events"
    ADD CONSTRAINT "verification_events_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE SET NULL DEFERRABLE;



CREATE POLICY "Admins can manage businesses" ON "public"."businesses" TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admins can manage location_hours" ON "public"."location_hours" TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admins can manage locations" ON "public"."locations" TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admins can manage offer_hours" ON "public"."offer_hours" TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admins can manage offer_locations" ON "public"."offer_locations" TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admins can manage offers" ON "public"."offers" TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admins can manage verification events" ON "public"."verification_events" TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Admins can view all users" ON "public"."users" FOR SELECT TO "authenticated" USING (( SELECT "public"."is_admin"() AS "is_admin"));



CREATE POLICY "Public can view hours for verified locations" ON "public"."location_hours" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."locations" "l"
  WHERE (("l"."id" = "location_hours"."location_id") AND ("l"."verification_status" = 'verified'::"public"."verification_status")))));



CREATE POLICY "Public can view hours for verified offers" ON "public"."offer_hours" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."offers" "o"
  WHERE (("o"."id" = "offer_hours"."offer_id") AND ("o"."verification_status" = 'verified'::"public"."verification_status") AND ("o"."is_active" = true)))));



CREATE POLICY "Public can view offer_locations for verified offers" ON "public"."offer_locations" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."offers" "o"
  WHERE (("o"."id" = "offer_locations"."offer_id") AND ("o"."verification_status" = 'verified'::"public"."verification_status") AND ("o"."is_active" = true)))));



CREATE POLICY "Public can view verified businesses" ON "public"."businesses" FOR SELECT USING ((("verification_status" = 'verified'::"public"."verification_status") AND ("is_active" = true)));



CREATE POLICY "Public can view verified locations" ON "public"."locations" FOR SELECT USING ((("verification_status" = 'verified'::"public"."verification_status") AND (EXISTS ( SELECT 1
   FROM "public"."businesses" "b"
  WHERE (("b"."id" = "locations"."business_id") AND ("b"."verification_status" = 'verified'::"public"."verification_status") AND ("b"."is_active" = true))))));



CREATE POLICY "Public can view verified offers" ON "public"."offers" FOR SELECT USING ((("verification_status" = 'verified'::"public"."verification_status") AND ("is_active" = true) AND ((NOT "is_seasonal") OR ((("now"())::"date" >= "season_start_date") AND (("now"())::"date" <= "season_end_date")))));



CREATE POLICY "Users can update their own profile" ON "public"."users" FOR UPDATE TO "authenticated" USING (("id" = "auth"."uid"()));



CREATE POLICY "Users can view their own profile" ON "public"."users" FOR SELECT TO "authenticated" USING (("id" = "auth"."uid"()));



ALTER TABLE "public"."businesses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."location_hours" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."locations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."offer_hours" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."offer_locations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."offers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."verification_events" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




























































































































































GRANT ALL ON FUNCTION "public"."deactivate_current_user"() TO "authenticated";


















GRANT SELECT,REFERENCES,TRIGGER ON TABLE "public"."businesses" TO "anon";
GRANT ALL ON TABLE "public"."businesses" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."businesses" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER ON TABLE "public"."location_hours" TO "anon";
GRANT ALL ON TABLE "public"."location_hours" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."location_hours" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER ON TABLE "public"."locations" TO "anon";
GRANT ALL ON TABLE "public"."locations" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."locations" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER ON TABLE "public"."offer_hours" TO "anon";
GRANT ALL ON TABLE "public"."offer_hours" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."offer_hours" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER ON TABLE "public"."offer_locations" TO "anon";
GRANT ALL ON TABLE "public"."offer_locations" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."offer_locations" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER ON TABLE "public"."offers" TO "anon";
GRANT ALL ON TABLE "public"."offers" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."offers" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER ON TABLE "public"."users" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,UPDATE ON TABLE "public"."users" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."users" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER ON TABLE "public"."verification_events" TO "anon";
GRANT SELECT,INSERT,REFERENCES,DELETE,TRIGGER,UPDATE ON TABLE "public"."verification_events" TO "authenticated";
GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."verification_events" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT UPDATE ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT UPDATE ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT UPDATE ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT REFERENCES,TRIGGER ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT REFERENCES,TRIGGER ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO "service_role";
































--
-- Dumped schema changes for auth and storage
--

CREATE OR REPLACE TRIGGER "on_auth_user_created" AFTER INSERT ON "auth"."users" FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_user"();



