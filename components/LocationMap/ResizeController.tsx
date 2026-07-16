"use client";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

// Switching tabs makes the map visible again but Leaflet never recalculates
// its size on its own, leaving it stuck rendering at that stale near-zero
// size. Watch the container and invalidate on resize.
export default function ResizeController() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);

  return null;
}
