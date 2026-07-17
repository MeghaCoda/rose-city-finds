import L from "leaflet";

// Below this distance, a pin selection flies at the default (snappy) speed.
// Beyond it, the flight gets a longer duration so a cross-town jump doesn't
// feel like a jump-cut.
export const LONG_FLIGHT_DISTANCE_METERS = 16_000; // ~10 miles
export const DEFAULT_FLY_DURATION = 0.75; // seconds
export const LONG_FLY_DURATION = 1.5; // seconds

// On the mobile list/map toggle, the map stays mounted but hidden
// (display: none) behind the list, so it mounts at zero size.

// flyTo() computes its animation curve from the container's pixel size, so
// firing it while hidden divides by a zero-size container and produces NaN —
// which throws asynchronously inside flyTo's own animation frame, not
// catchable at the call site. Jump instantly instead when there's no size to
// animate within.
export function flyToSafe(map: L.Map, target: L.LatLngExpression, zoom: number, options: L.ZoomPanOptions) {
  const size = map.getSize();
  if (size.x === 0 || size.y === 0) {
    map.setView(target, zoom, { animate: false });
    return;
  }
  map.flyTo(target, zoom, options);
}
