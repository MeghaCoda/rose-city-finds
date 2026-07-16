"use client";
import L from "leaflet";
import { useCallback, useEffect } from "react";
import { useMap, useMapEvent } from "react-leaflet";
import { computeVisibleLabelIds, getClusterBubbleBoxes, measureLabelWidth, ScreenLabel } from "./labelCollision";
import { hasCoordinates, Location } from "./types";

interface LabelCollisionControllerProps<T extends Location> {
  data: T[];
  selectedId?: string | null;
  markerRefs: React.RefObject<Map<string, L.Marker>>;
  tooltipRefs: React.RefObject<Map<string, L.Tooltip>>;
}

export default function LabelCollisionController<T extends Location>({ data, selectedId, markerRefs, tooltipRefs }: LabelCollisionControllerProps<T>) {
  const map = useMap();

  const recompute = useCallback(() => {
    const located = data.filter(hasCoordinates);
    // The selected pin's label always wins any collision — it's the one
    // the user just asked to see.
    const ordered = selectedId
      ? [...located.filter((d) => d.id === selectedId), ...located.filter((d) => d.id !== selectedId)]
      : located;

    const labels: ScreenLabel[] = [];
    for (const item of ordered) {
      const marker = markerRefs.current.get(item.id);
      if (!marker) continue;
      // A marker currently absorbed into a cluster bubble has no rendered
      // element — nothing to place a label for.
      if (!marker.getElement()) continue;
      const point = map.latLngToContainerPoint(marker.getLatLng());
      labels.push({ id: item.id, point, width: measureLabelWidth(item.business.name) });
    }

    const nextVisible = computeVisibleLabelIds(labels, getClusterBubbleBoxes(map));

    // Toggling visibility via the tooltip's own open/close bookkeeping
    // (marker.openTooltip()/closeTooltip()) doesn't stick: a permanent
    // Tooltip registers its own "add" handler on the marker that force
    // -reopens itself every time the marker's underlying layer re-enters
    // the map — which is exactly what leaflet.markercluster does whenever
    // a marker pops out of a cluster. That silently undid closeTooltip()
    // calls, leaving labels visible on top of cluster bubbles. Setting the
    // tooltip's own DOM display style instead sidesteps that fight
    // entirely — nothing else touches it.
    for (const label of labels) {
      const tooltipEl = tooltipRefs.current.get(label.id)?.getElement();
      if (!tooltipEl) continue;
      tooltipEl.style.display = nextVisible.has(label.id) ? "" : "none";
    }
  }, [data, selectedId, map, markerRefs, tooltipRefs]);

  // leaflet.markercluster rebuilds its own cluster bubbles synchronously
  // inside its *own* zoomend/moveend handlers. Handlers for the same event
  // run in registration order, and there's no guarantee ours runs last, so
  // calling recompute() directly here can read cluster bubble positions
  // from a heartbeat before the rebuild — a stale obstacle map. Deferring
  // to the next animation frame guarantees every synchronous handler for
  // this event (including markercluster's) has already run.
  const scheduleRecompute = useCallback(() => {
    requestAnimationFrame(recompute);
  }, [recompute]);

  useMapEvent("zoomend", scheduleRecompute);
  useMapEvent("moveend", scheduleRecompute);

  useEffect(() => {
    recompute();
  }, [recompute]);

  return null;
}
