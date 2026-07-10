-- Add indexes on foreign key columns that are missing them.
-- favorites.user_id is already covered as the leading column of
-- favorites_user_resource_unique, so it's excluded here.

CREATE INDEX "idx_community_notes_author_id" ON "public"."community_notes" USING "btree" ("author_id");
CREATE INDEX "idx_community_notes_resource_id" ON "public"."community_notes" USING "btree" ("resource_id");

CREATE INDEX "idx_edit_history_approved_by" ON "public"."edit_history" USING "btree" ("approved_by");
CREATE INDEX "idx_edit_history_changed_by" ON "public"."edit_history" USING "btree" ("changed_by");
CREATE INDEX "idx_edit_history_edit_id" ON "public"."edit_history" USING "btree" ("edit_id");
CREATE INDEX "idx_edit_history_resource_id" ON "public"."edit_history" USING "btree" ("resource_id");

CREATE INDEX "idx_favorites_resource_id" ON "public"."favorites" USING "btree" ("resource_id");

CREATE INDEX "idx_online_access_resource_id" ON "public"."online_access" USING "btree" ("resource_id");

CREATE INDEX "idx_other_access_resource_id" ON "public"."other_access" USING "btree" ("resource_id");

CREATE INDEX "idx_pending_edits_resource_id" ON "public"."pending_edits" USING "btree" ("resource_id");
CREATE INDEX "idx_pending_edits_reviewed_by" ON "public"."pending_edits" USING "btree" ("reviewed_by");
CREATE INDEX "idx_pending_edits_submitted_by" ON "public"."pending_edits" USING "btree" ("submitted_by");

CREATE INDEX "idx_physical_locations_created_by" ON "public"."physical_locations" USING "btree" ("created_by");
CREATE INDEX "idx_physical_locations_resource_id" ON "public"."physical_locations" USING "btree" ("resource_id");

CREATE INDEX "idx_resource_benefits_resource_id" ON "public"."resource_benefits" USING "btree" ("resource_id");

CREATE INDEX "idx_resource_eligibility_resource_id" ON "public"."resource_eligibility" USING "btree" ("resource_id");

CREATE INDEX "idx_resource_hours_physical_location_id" ON "public"."resource_hours" USING "btree" ("physical_location_id");

CREATE INDEX "idx_resources_created_by" ON "public"."resources" USING "btree" ("created_by");

CREATE INDEX "idx_submissions_reviewed_by" ON "public"."submissions" USING "btree" ("reviewed_by");
CREATE INDEX "idx_submissions_submitted_by" ON "public"."submissions" USING "btree" ("submitted_by");

CREATE INDEX "idx_verification_events_physical_location_id" ON "public"."verification_events" USING "btree" ("physical_location_id");
CREATE INDEX "idx_verification_events_resource_id" ON "public"."verification_events" USING "btree" ("resource_id");
CREATE INDEX "idx_verification_events_verified_by" ON "public"."verification_events" USING "btree" ("verified_by");

-- Keep resources.updated_at current on every update. The column's
-- DEFAULT now() only fires on INSERT, so without this trigger it never
-- moves again after row creation, even though admin edit/approval flows
-- update the row repeatedly.
CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";

CREATE TRIGGER "resources_set_updated_at"
    BEFORE UPDATE ON "public"."resources"
    FOR EACH ROW
    EXECUTE FUNCTION "public"."set_updated_at"();

-- Revoke TRUNCATE/MAINTAIN from anon/authenticated. RLS policies only
-- filter SELECT/INSERT/UPDATE/DELETE; TRUNCATE and MAINTAIN (VACUUM,
-- ANALYZE, CLUSTER, REFRESH MATERIALIZED VIEW) are gated by a coarse
-- table-level grant that RLS never consults, so these roles picked
-- them up as dead weight from Supabase's default "GRANT ALL ON
-- TABLES" bootstrap.
REVOKE TRUNCATE, MAINTAIN ON ALL TABLES IN SCHEMA "public" FROM "anon", "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
    REVOKE TRUNCATE, MAINTAIN ON TABLES FROM "anon", "authenticated";

-- community_notes was missing the admin view/update policies every
-- other admin-managed table has (e.g. resource_benefits), leaving
-- admins unable to list or edit notes despite owning insert/delete.
CREATE POLICY "Admins can view all notes" ON "public"."community_notes" FOR SELECT USING ("public"."is_admin"());

CREATE POLICY "Admins can update notes" ON "public"."community_notes" FOR UPDATE USING ("public"."is_admin"());
