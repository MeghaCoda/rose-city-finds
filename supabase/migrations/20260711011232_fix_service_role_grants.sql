-- service_role was only ever granted REFERENCES/TRIGGER/TRUNCATE/MAINTAIN on
-- every table (inherited unchanged from the original schema dump) -- missing
-- SELECT/INSERT/UPDATE/DELETE means the role that's supposed to have full,
-- RLS-bypassing access couldn't actually read or write anything.

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
    "public"."businesses",
    "public"."locations",
    "public"."offers",
    "public"."offer_locations",
    "public"."location_hours",
    "public"."offer_hours",
    "public"."users",
    "public"."verification_events"
TO "service_role";
