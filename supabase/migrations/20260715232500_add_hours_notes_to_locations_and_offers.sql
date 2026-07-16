-- Hours notes were living on individual location_hours/offer_hours rows,
-- one field per weekday. A note like "closed on holidays" describes the
-- whole hours schedule, not a single day, so move it up to one field per
-- location/offer instead.

ALTER TABLE "public"."locations" ADD COLUMN "hours_notes" "text";
ALTER TABLE "public"."offers" ADD COLUMN "hours_notes" "text";

ALTER TABLE "public"."location_hours" DROP COLUMN "notes";
ALTER TABLE "public"."offer_hours" DROP COLUMN "notes";
