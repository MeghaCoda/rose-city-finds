-- Unique resource names (case-insensitive)
CREATE UNIQUE INDEX resources_name_unique
  ON public.resources (lower(name));

-- Unique physical locations by address + address2 + city (case-insensitive).
-- COALESCE normalizes NULL address2 and empty string so they're treated the same.
CREATE UNIQUE INDEX physical_locations_address_unique
  ON public.physical_locations (lower(address), lower(COALESCE(address2, '')), lower(city));
