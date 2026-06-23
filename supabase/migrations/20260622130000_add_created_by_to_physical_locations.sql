ALTER TABLE "physical_locations"
  ADD COLUMN "created_by" uuid REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;
