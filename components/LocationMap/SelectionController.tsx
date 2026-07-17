"use client";
import L from "leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { DEFAULT_FLY_DURATION, flyToSafe, LONG_FLIGHT_DISTANCE_METERS, LONG_FLY_DURATION } from "./mapMotion";
import { hasCoordinates, Location } from "./types";

interface SelectionControllerProps<T extends Location> {
  selectedId?: string | null;
  data: T[];
}

export default function SelectionController<T extends Location>({ selectedId, data }: SelectionControllerProps<T>) {
  const map = useMap();

  useEffect(() => {
    if (!selectedId) return;
    const item = data.find((d) => d.id === selectedId);
    if (!item || !hasCoordinates(item)) return;
    const target = L.latLng(item.latitude, item.longitude);
    try {
      // The selected marker is always rendered outside the cluster group
      // (see ResourceMap), so it's never hidden inside a cluster bubble and
      // a plain pan/zoom is enough to bring it into view.
      const distance = map.getCenter().distanceTo(target);
      const duration = distance > LONG_FLIGHT_DISTANCE_METERS ? LONG_FLY_DURATION : DEFAULT_FLY_DURATION;
      flyToSafe(map, target, map.getZoom(), { animate: true, duration });
    } catch {
      // no-op: map may not be ready yet
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  return null;
}
