// Faker-backed row generators used by generate-bulk-seed.mjs. Split out from
// the main script so they're importable (and unit-testable) without running
// the script's file-write side effect. Callers are expected to have already
// called faker.seed(...) if they want deterministic output.

import { faker } from "@faker-js/faker";
import { sql } from "./seedFormat.mjs";

export function pickVerificationStatus() {
  const r = faker.number.float({ min: 0, max: 1 });
  return r < 0.75 ? "verified" : r < 0.90 ? "pending" : r < 0.97 ? "rejected" : "delisted";
}

export function pastThenUpdated(referenceDate) {
  const createdAt = faker.date.past({ years: 2, refDate: referenceDate });
  const updatedAt = faker.date.between({ from: createdAt, to: referenceDate });
  return [createdAt, updatedAt];
}

export function weightedCount(weights) {
  const r = faker.number.float({ min: 0, max: 1 });
  let acc = 0;
  for (const [count, weight] of weights) {
    acc += weight;
    if (r < acc) return count;
  }
  return weights[weights.length - 1][0];
}

export function buildHoursRows(parentId, { referenceDate, days, openTimes, closeTimes }) {
  const rows = [];
  const selectedDays = faker.helpers.arrayElements(days, { min: 2, max: 7 });
  const seasonal = faker.datatype.boolean(0.1);
  let validFrom = null, validUntil = null;
  if (seasonal) {
    const from = faker.date.soon({ days: 60, refDate: referenceDate });
    validFrom = from.toISOString().slice(0, 10);
    validUntil = faker.date.soon({ days: 240, refDate: from }).toISOString().slice(0, 10);
  }
  for (const day of selectedDays) {
    const opens = faker.helpers.arrayElement(openTimes);
    const closes = faker.helpers.arrayElement(closeTimes);
    rows.push(`  (${sql(parentId)}, ${sql(day)}, ${sql(opens)}, ${sql(closes)}, ` +
      `${sql(validFrom)}, ${sql(validUntil)})`);
  }
  return rows;
}

// A note about the hours as a whole (e.g. "closed on holidays") -- one per
// parent (location/offer), not per weekday row.
export function pickHoursNotes() {
  return faker.datatype.boolean(0.15) ? faker.lorem.sentence() : null;
}

// One event per business/location/offer that's actually been reviewed
// (verification_status != 'pending' means someone looked at it).
export function buildVerificationEvent(targetColumn, targetId, statusChangedAt, { adminIds, verificationMethods }) {
  const outcome = statusChangedAt.outcome;
  return `  (${sql(statusChangedAt.at.toISOString())}, ${sql(faker.helpers.arrayElement(adminIds))}, ` +
    `${sql(faker.helpers.arrayElement(verificationMethods))}, ${sql(outcome)}, ` +
    `${faker.datatype.boolean(0.5) ? sql(faker.lorem.sentence()) : "NULL"}, ` +
    `${targetColumn === "business_id" ? sql(targetId) : "NULL"}, ` +
    `${targetColumn === "offer_id" ? sql(targetId) : "NULL"}, ` +
    `${targetColumn === "location_id" ? sql(targetId) : "NULL"})`;
}
