export const FALLBACK_CENTER: [number, number] = [45.523, -122.6765];
export const FALLBACK_ZOOM = 13;
export const MAX_ZOOM = 16;
// One level below MAX_ZOOM so the deepest zoom step always shows
// individual pins instead of a cluster the user can't click through.
export const DISABLE_CLUSTERING_AT_ZOOM = MAX_ZOOM - 1;
