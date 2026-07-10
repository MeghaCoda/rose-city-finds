ALTER TABLE ONLY "public"."community_notes"
    ADD CONSTRAINT "community_notes_rating_range" CHECK ((("rating" IS NULL) OR (("rating" >= 1) AND ("rating" <= 5))));


ALTER TABLE ONLY "public"."community_notes" ALTER COLUMN "author_id" DROP NOT NULL;
ALTER TABLE ONLY "public"."community_notes" DROP CONSTRAINT "community_notes_author_id_fkey";
ALTER TABLE ONLY "public"."community_notes"
    ADD CONSTRAINT "community_notes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE SET NULL DEFERRABLE;


ALTER TABLE ONLY "public"."edit_history" ALTER COLUMN "changed_by" DROP NOT NULL;
ALTER TABLE ONLY "public"."edit_history" DROP CONSTRAINT "edit_history_changed_by_fkey";
ALTER TABLE ONLY "public"."edit_history"
    ADD CONSTRAINT "edit_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE SET NULL DEFERRABLE;

ALTER TABLE ONLY "public"."edit_history" DROP CONSTRAINT "edit_history_approved_by_fkey";
ALTER TABLE ONLY "public"."edit_history"
    ADD CONSTRAINT "edit_history_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE SET NULL DEFERRABLE;


ALTER TABLE ONLY "public"."pending_edits" ALTER COLUMN "submitted_by" DROP NOT NULL;
ALTER TABLE ONLY "public"."pending_edits" DROP CONSTRAINT "pending_edits_submitted_by_fkey";
ALTER TABLE ONLY "public"."pending_edits"
    ADD CONSTRAINT "pending_edits_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE SET NULL DEFERRABLE;

ALTER TABLE ONLY "public"."pending_edits" DROP CONSTRAINT "pending_edits_reviewed_by_fkey";
ALTER TABLE ONLY "public"."pending_edits"
    ADD CONSTRAINT "pending_edits_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE SET NULL DEFERRABLE;


ALTER TABLE ONLY "public"."submissions" ALTER COLUMN "submitted_by" DROP NOT NULL;
ALTER TABLE ONLY "public"."submissions" DROP CONSTRAINT "submissions_submitted_by_fkey";
ALTER TABLE ONLY "public"."submissions"
    ADD CONSTRAINT "submissions_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE SET NULL DEFERRABLE;

ALTER TABLE ONLY "public"."submissions" DROP CONSTRAINT "submissions_reviewed_by_fkey";
ALTER TABLE ONLY "public"."submissions"
    ADD CONSTRAINT "submissions_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE SET NULL DEFERRABLE;


ALTER TABLE ONLY "public"."verification_events" DROP CONSTRAINT "verification_events_verified_by_fkey";
ALTER TABLE ONLY "public"."verification_events"
    ADD CONSTRAINT "verification_events_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE SET NULL DEFERRABLE;
