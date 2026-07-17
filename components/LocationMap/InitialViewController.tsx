"use client";
import L from "leaflet";
import { useCallback, useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import { FALLBACK_CENTER } from "./constants";
import { Location, hasCoordinates } from "./types";

// --- Initial view: fit to the nearest results ---------------------------
//
// Landing on a fixed city-wide center/zoom risks showing the user almost
// nothing on first paint if their real area is sparse, or they're just far
// from downtown Portland (the fallback center) -- an empty-feeling map AND
// list at once. Instead, once we know a reference point (the user's real
// location via geolocation, falling back to the city center) and results
// have loaded, fit the view to the nearest handful of results. Capped so a
// genuinely sparse area doesn't drag the view out to a totally different
// city just to hit a result-count target -- showing fewer nearby results
// beats silently relocating the user's view somewhere they didn't ask
// about.
const TARGET_INITIAL_RESULT_COUNT = 10;
const MIN_INITIAL_ZOOM = 9; // floor: don't zoom out past a wide metro-area view
const INITIAL_BOUNDS_PADDING: [number, number] = [40, 40]; // px, keeps edge pins off the container edge

interface InitialViewControllerProps<T extends Location> {
  data: T[];
}

export default function InitialViewController<T extends Location>({ data }: InitialViewControllerProps<T>) {
  const map = useMap();
  const hasFitRef = useRef(false);
  const referencePointRef = useRef<L.LatLngExpression | null>(null);

  const tryFit = useCallback(() => {
    if (hasFitRef.current) return;
    const referencePoint = referencePointRef.current;
    if (!referencePoint) return;
    const located = data.filter(hasCoordinates);
    if (located.length === 0) return;

    hasFitRef.current = true;
    try {
      const ref = L.latLng(referencePoint);
      const nearest = [...located]
        .sort((a, b) =>
          ref.distanceTo(L.latLng(a.latitude, a.longitude)) - ref.distanceTo(L.latLng(b.latitude, b.longitude))
        )
        .slice(0, TARGET_INITIAL_RESULT_COUNT);

      const bounds = L.latLngBounds(nearest.map((item): [number, number] => [item.latitude, item.longitude]));
      map.fitBounds(bounds, { padding: INITIAL_BOUNDS_PADDING });
      // A sparse area can force fitBounds to zoom out further than useful
      // (e.g. across state lines to scrounge up 10 results) -- prefer
      // showing what's actually nearby over chasing the target count.
      if (map.getZoom() < MIN_INITIAL_ZOOM) {
        map.setZoom(MIN_INITIAL_ZOOM);
      }
    } catch {
      // no-op: map may not be ready yet
    }
  }, [data, map]);

  // Determine the reference point once: the user's real location if
  // geolocation succeeds, otherwise the city-wide fallback center.
  useEffect(() => {
    if (!navigator.geolocation) {
      referencePointRef.current = FALLBACK_CENTER;
      tryFit();
      return;
    }
    let active = true;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!active) return;
        const { latitude, longitude } = pos.coords;
        referencePointRef.current = Number.isFinite(latitude) && Number.isFinite(longitude)
          ? [latitude, longitude]
          : FALLBACK_CENTER;
        tryFit();
      },
      (err) => {
        console.warn("Geolocation unavailable:", err.message);
        if (!active) return;
        referencePointRef.current = FALLBACK_CENTER;
        tryFit();
      },
      { timeout: 8000, maximumAge: 60_000 }
    );

    return () => { active = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Results can finish loading after geolocation already resolved (or vice
  // versa) -- retry whenever either piece of async state changes; hasFitRef
  // guards the actual fit to only ever happen once.
  useEffect(() => {
    tryFit();
  }, [tryFit]);

  return null;
}
