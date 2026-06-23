SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'physical_locations';