"use client";
import {
    MapContainer,
    Marker,
    Popup,
    Tooltip,
    useMap,
    useMapEvent
} from "react-leaflet"
import MarkerClusterGroup from "react-leaflet-markercluster";
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-markercluster/styles';
import "./LocationMap.css";
import L from "leaflet";
import { useCallback, useEffect, useMemo, useRef } from "react";
import ProtomapsLayer from "@/components/ProtomapsLayer";

export interface Location {
  id: string;
  address: string;
  address2?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  business: { name: string };
}

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// viewBox stays fixed at the pin's original 24x36 art; only the rendered
// width/height below scale it, so the path/circle coordinates never need
// to change between the normal and highlighted sizes.
function pinSvg(fill: string, width: number, height: number) {
  return `<svg width="${width}" height="${height}" viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.37 0 0 5.37 0 12c0 6.63 12 24 12 24S24 18.63 24 12C24 5.37 18.63 0 12 0z" fill="${fill}"/><circle cx="12" cy="11" r="4" fill="white"/></svg>`
}

// Half the original pin dimensions (24x36 / 28x42). The highlighted pin is
// 50% bigger than the normal one.
const PIN_WIDTH = 12;
const PIN_HEIGHT = 18;
const HIGHLIGHT_PIN_WIDTH = PIN_WIDTH * 1.5;
const HIGHLIGHT_PIN_HEIGHT = PIN_HEIGHT * 1.5;

// The name label is rendered as a separate Leaflet Tooltip (see LocationMarker)
// rather than baked into this icon, so the icon itself never changes when a
// label is shown/hidden by the collision-avoidance pass below.
function createLocationIcon(highlighted: boolean) {
  const width = highlighted ? HIGHLIGHT_PIN_WIDTH : PIN_WIDTH;
  const height = highlighted ? HIGHLIGHT_PIN_HEIGHT : PIN_HEIGHT;
  const fill = highlighted ? '#E8612A' : '#2563EB';

  return L.divIcon({
    className: '',
    iconSize: [width, height],
    iconAnchor: [width / 2, height],
    popupAnchor: [0, -(height + 2)],
    // Anchors the Tooltip vertically centered on the pin glyph (matching the
    // old baked-in label's `top: 50%`), regardless of highlighted size.
    tooltipAnchor: [0, -height / 2],
    html: pinSvg(fill, width, height),
  });
}

const FALLBACK_CENTER: [number, number] = [45.523, -122.6765];
const FALLBACK_ZOOM = 13;
const USER_ZOOM = 15;

// Below this distance, a pin selection flies at the default (snappy) speed.
// Beyond it, the flight gets a longer duration so a cross-town jump doesn't
// feel like a jump-cut.
const LONG_FLIGHT_DISTANCE_METERS = 16_000; // ~10 miles
const DEFAULT_FLY_DURATION = 0.75; // seconds
const LONG_FLY_DURATION = 1.5; // seconds

// On the mobile list/map toggle, the map stays mounted but hidden
// (display: none) behind the list, so it mounts at zero size.

// flyTo() computes its animation curve from the container's pixel size, so
// firing it while hidden divides by a zero-size container and produces NaN —
// which throws asynchronously inside flyTo's own animation frame, not
// catchable at the call site. Jump instantly instead when there's no size to
// animate within.
function flyToSafe(map: L.Map, target: L.LatLngExpression, zoom: number, options: L.ZoomPanOptions) {
  const size = map.getSize();
  if (size.x === 0 || size.y === 0) {
    map.setView(target, zoom, { animate: false });
    return;
  }
  map.flyTo(target, zoom, options);
}

// Switching tabs makes the map visible again but Leaflet never recalculates
// its size on its own, leaving it stuck rendering at that stale near-zero
// size. Watch the container and invalidate on resize.
function ResizeController() {
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

function GeolocationController() {
  const map = useMap();

  useEffect(() => {
    if (!navigator.geolocation) return;
    let active = true;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (!active) return;
        const { latitude, longitude } = pos.coords;
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
        try {
          flyToSafe(map, [latitude, longitude], USER_ZOOM, { animate: true, duration: 1.5 });
        } catch {
          // no-op: map may not be ready yet
        }
      },
      (err) => {
        console.warn("Geolocation unavailable:", err.message);
      },
      { timeout: 8000, maximumAge: 60_000 }
    );

    return () => { active = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

// --- Label collision avoidance ------------------------------------------
//
// Leaflet.markercluster only prevents ICON overlap (by merging nearby pins
// into a cluster bubble); it has no opinion on the text LABELS next to
// those icons, so two pins that sit just outside clustering range but are
// still close on screen render overlapping name labels. Google Maps solves
// this the cheap way: labels are placed in priority order against a
// screen-space occupancy list, and any label that would collide is simply
// hidden (the icon stays; only the text goes) rather than physically
// repositioned. That's what this does, recomputed only on zoomend/moveend
// so it's proportional to the number of currently-visible pins, not the
// full dataset.
const LABEL_FONT = "600 11px system-ui, sans-serif";
const LABEL_HEIGHT = 16;
const LABEL_GAP = 4; // gap between the icon and the label, mirrors the old baked-in span
const LABEL_PADDING = 4; // horizontal buffer so adjacent labels don't feel cramped
const ICON_HALF_WIDTH = PIN_WIDTH / 2;

let labelMeasureContext: CanvasRenderingContext2D | null = null;
function measureLabelWidth(text: string): number {
  if (!labelMeasureContext) {
    labelMeasureContext = document.createElement("canvas").getContext("2d");
  }
  if (!labelMeasureContext) return text.length * 7;
  labelMeasureContext.font = LABEL_FONT;
  return labelMeasureContext.measureText(text).width;
}

interface ScreenLabel {
  id: string;
  point: L.Point;
  width: number;
}

interface LabelBox {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

function boxesOverlap(a: LabelBox, b: LabelBox): boolean {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

// Cluster bubbles (leaflet.markercluster's own merged-pin icons) occupy
// screen space too, but they're not part of `labels` — they have no name to
// place. Read their rendered boxes straight from the DOM (scoped to this
// map's container) so a label can't land on top of one, matching the "hide
// on collision" screenshot pull-up: a bubble is a "no room here" obstacle,
// not a competing label.
function getClusterBubbleBoxes(map: L.Map): LabelBox[] {
  const container = map.getContainer();
  const containerRect = container.getBoundingClientRect();
  return Array.from(container.querySelectorAll(".marker-cluster")).map((el) => {
    const r = el.getBoundingClientRect();
    return {
      left: r.left - containerRect.left,
      right: r.right - containerRect.left,
      top: r.top - containerRect.top,
      bottom: r.bottom - containerRect.top,
    };
  });
}

// `labels` must already be in priority order (highest priority first) —
// earlier entries win any collision against later ones. `obstacles` are
// pre-occupied regions (cluster bubbles) that block labels but never
// themselves get hidden.
function computeVisibleLabelIds(labels: ScreenLabel[], obstacles: LabelBox[] = []): Set<string> {
  const visible = new Set<string>();
  const placed: LabelBox[] = [...obstacles];

  for (const label of labels) {
    const box: LabelBox = {
      right: label.point.x - ICON_HALF_WIDTH - LABEL_GAP,
      left: label.point.x - ICON_HALF_WIDTH - LABEL_GAP - label.width - LABEL_PADDING,
      top: label.point.y - LABEL_HEIGHT / 2,
      bottom: label.point.y + LABEL_HEIGHT / 2,
    };
    if (placed.some((p) => boxesOverlap(box, p))) continue;
    visible.add(label.id);
    placed.push(box);
  }

  return visible;
}

interface LabelCollisionControllerProps<T extends Location> {
  data: T[];
  selectedId?: string | null;
  markerRefs: React.RefObject<Map<string, L.Marker>>;
  tooltipRefs: React.RefObject<Map<string, L.Tooltip>>;
}

function LabelCollisionController<T extends Location>({ data, selectedId, markerRefs, tooltipRefs }: LabelCollisionControllerProps<T>) {
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

interface ResourceMapProps<T extends Location> {
  onSelect: (a: T) => void;
  data: T[];
  selectedId?: string | null;
}

function hasCoordinates<T extends Location>(item: T): item is T & { latitude: number; longitude: number } {
  return Number.isFinite(item.latitude) && Number.isFinite(item.longitude);
}

interface SelectionControllerProps<T extends Location> {
  selectedId?: string | null;
  data: T[];
}

function SelectionController<T extends Location>({ selectedId, data }: SelectionControllerProps<T>) {
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

function LocationMarker<T extends Location & { latitude: number; longitude: number }>({
  item,
  highlighted,
  onSelect,
  markerRefs,
  tooltipRefs,
}: {
  item: T;
  highlighted: boolean;
  onSelect: (item: T) => void;
  markerRefs: React.RefObject<Map<string, L.Marker>>;
  tooltipRefs: React.RefObject<Map<string, L.Tooltip>>;
}) {
  // react-leaflet only calls marker.setIcon() when the icon prop's
  // *reference* changes, but divIcon's setIcon replaces the marker's DOM
  // node outright. Without memoizing, every marker got a brand-new icon
  // object (and DOM swap) on every render of the map — including markers
  // whose highlighted state didn't change — which read as every pin
  // blinking each time a different pin was selected.
  const icon = useMemo(() => createLocationIcon(highlighted), [highlighted]);
  const position = useMemo<[number, number]>(
    () => [item.latitude, item.longitude],
    [item.latitude, item.longitude]
  );

  return (
    <Marker
      position={position}
      icon={icon}
      ref={(marker) => {
        if (marker) markerRefs.current.set(item.id, marker);
        else markerRefs.current.delete(item.id);
      }}
      eventHandlers={{
        click: () => onSelect(item),
      }}
    >
      {/* permanent so it's always rendered at a fixed position rather than
          on hover; actual show/hide is driven by LabelCollisionController
          toggling this DOM node's display style directly (see there for why
          openTooltip()/closeTooltip() don't work for this) */}
      <Tooltip
        permanent
        direction="left"
        opacity={1}
        className="location-label"
        ref={(tooltip) => {
          if (tooltip) tooltipRefs.current.set(item.id, tooltip);
          else tooltipRefs.current.delete(item.id);
        }}
      >
        {item.business.name}
      </Tooltip>
      <Popup>
        <p>{item.address}</p>
        {item.address2 && <p>{item.address2}</p>}
      </Popup>
    </Marker>
  );
}

function ResourceMap<T extends Location>({ onSelect, data, selectedId }: ResourceMapProps<T>) {
    const markerRefs = useRef<Map<string, L.Marker>>(new Map());
    const tooltipRefs = useRef<Map<string, L.Tooltip>>(new Map());
    const locatedItems = data.filter(hasCoordinates);
    // The selected pin is rendered as its own layer, outside the cluster
    // group, so it can never be swallowed into a cluster bubble (including
    // after the user zooms back out post-selection).
    const clusteredItems = locatedItems.filter(item => item.id !== selectedId);
    const selectedItem = locatedItems.find(item => item.id === selectedId);

    return (
      <div className="h-full w-full min-w-0">
        <MapContainer center={FALLBACK_CENTER} zoom={FALLBACK_ZOOM} maxZoom={15} style={{ height: '100%', width: '100%' }}>
          <ProtomapsLayer theme="light" />
          <ResizeController />
          <GeolocationController />
          <SelectionController selectedId={selectedId} data={data} />
          <LabelCollisionController data={data} selectedId={selectedId} markerRefs={markerRefs} tooltipRefs={tooltipRefs} />
          {/* animate={false}: leaflet.markercluster's default split/merge
              animation runs its own CSS-transition async of the map's
              zoomend/moveend events, so a marker can still be mid-transition
              into/out of a cluster when LabelCollisionController reads
              "is this marker currently clustered?" -- a stale read that
              left some labels overlapping a cluster bubble. Disabling it
              makes cluster membership changes land synchronously. */}
          <MarkerClusterGroup animate={false}>
            {clusteredItems.map(item => (
              <LocationMarker key={item.id} item={item} highlighted={false} onSelect={onSelect} markerRefs={markerRefs} tooltipRefs={tooltipRefs} />
            ))}
          </MarkerClusterGroup>
          {selectedItem && (
            <LocationMarker key={selectedItem.id} item={selectedItem} highlighted onSelect={onSelect} markerRefs={markerRefs} tooltipRefs={tooltipRefs} />
          )}
        </MapContainer>
      </div>
    )
}

export default ResourceMap;
