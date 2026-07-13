// SQL literal formatting helpers used by generate-bulk-seed.mjs. Pure and
// faker-independent, so they're split out for direct unit testing.

export function sql(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number") return String(value);
  return `'${String(value).replace(/'/g, "''")}'`;
}

export function sqlArray(values, type) {
  if (!values || values.length === 0) return "NULL";
  return `ARRAY[${values.map((v) => sql(v)).join(",")}]::${type}[]`;
}
