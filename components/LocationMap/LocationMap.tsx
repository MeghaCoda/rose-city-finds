"use client";
import {
    MapContainer,
    Marker,
    Popup,
    useMap
} from "react-leaflet"
import MarkerClusterGroup from "react-leaflet-markercluster";
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-markercluster/styles';
import L from "leaflet";
import { useEffect, useRef } from "react";
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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Half the original pin dimensions (24x36 / 28x42). The highlighted pin is
// 50% bigger than the normal one.
const PIN_WIDTH = 12;
const PIN_HEIGHT = 18;
const HIGHLIGHT_PIN_WIDTH = PIN_WIDTH * 1.5;
const HIGHLIGHT_PIN_HEIGHT = PIN_HEIGHT * 1.5;

// The name label lives outside the pin's own box (right: 100%), so it
// doesn't affect iconAnchor/iconSize, which stay pinned to the marker glyph.
function createLocationIcon(name: string, highlighted: boolean) {
  const width = highlighted ? HIGHLIGHT_PIN_WIDTH : PIN_WIDTH;
  const height = highlighted ? HIGHLIGHT_PIN_HEIGHT : PIN_HEIGHT;
  const fill = highlighted ? '#E8612A' : '#2563EB';
  const label = escapeHtml(name);

  return L.divIcon({
    className: '',
    iconSize: [width, height],
    iconAnchor: [width / 2, height],
    popupAnchor: [0, -(height + 2)],
    html: `<div style="position:relative;width:${width}px;height:${height}px;">` +
      `<span style="position:absolute;top:50%;right:calc(100% + 4px);transform:translateY(-50%);white-space:nowrap;font:600 11px system-ui, sans-serif;color:#1f2937;text-shadow:-1px -1px 1px #fff,1px -1px 1px #fff,-1px 1px 1px #fff,1px 1px 1px #fff,0 -1px 1px #fff,0 1px 1px #fff,-1px 0 1px #fff,1px 0 1px #fff;">${label}</span>` +
      pinSvg(fill, width, height) +
      `</div>`,
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

interface ResourceMapProps<T extends Location> {
  onSelect: (a: T) => void;
  data: T[];
  selectedId?: string | null;
}

function hasCoordinates<T extends Location>(item: T): item is T & { latitude: number; longitude: number } {
  return Number.isFinite(item.latitude) && Number.isFinite(item.longitude);
}

// leaflet.markercluster augments L at runtime (side-effect import above) but
// ships no type declarations, so the group instance is typed structurally
// here rather than as L.MarkerClusterGroup.
interface MarkerClusterGroupInstance extends L.LayerGroup {
  zoomToShowLayer(layer: L.Layer, callback?: () => void): void;
}

interface SelectionControllerProps<T extends Location> {
  selectedId?: string | null;
  data: T[];
  markerRefs: React.RefObject<Map<string, L.Marker>>;
  clusterGroupRef: React.RefObject<MarkerClusterGroupInstance | null>;
}

function SelectionController<T extends Location>({ selectedId, data, markerRefs, clusterGroupRef }: SelectionControllerProps<T>) {
  const map = useMap();

  useEffect(() => {
    if (!selectedId) return;
    const item = data.find((d) => d.id === selectedId);
    if (!item || !hasCoordinates(item)) return;
    const target = L.latLng(item.latitude, item.longitude);
    const marker = markerRefs.current.get(selectedId);
    const clusterGroup = clusterGroupRef.current;
    try {
      // A selected marker can be absorbed into a cluster bubble at the
      // current zoom, in which case just panning/flying to it leaves the
      // highlighted pin invisible. zoomToShowLayer is leaflet.markercluster's
      // own API for this: it pans, zooms, and spiderfies as needed until the
      // specific marker is actually on screen.
      if (marker && clusterGroup) {
        clusterGroup.zoomToShowLayer(marker);
        return;
      }
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

function ResourceMap<T extends Location>({ onSelect, data, selectedId }: ResourceMapProps<T>) {
    const markerRefs = useRef<Map<string, L.Marker>>(new Map());
    const clusterGroupRef = useRef<MarkerClusterGroupInstance | null>(null);

    return (
      <div className="h-full w-full min-w-0">
        <MapContainer center={FALLBACK_CENTER} zoom={FALLBACK_ZOOM} maxZoom={15} style={{ height: '100%', width: '100%' }}>
          <ProtomapsLayer theme="light" />
          <ResizeController />
          <GeolocationController />
          <SelectionController selectedId={selectedId} data={data} markerRefs={markerRefs} clusterGroupRef={clusterGroupRef} />
          <MarkerClusterGroup ref={clusterGroupRef}>
            {data.filter(hasCoordinates).map(item => (
                <Marker
                  key={item.id}
                  ref={(marker) => {
                    if (marker) markerRefs.current.set(item.id, marker);
                    else markerRefs.current.delete(item.id);
                  }}
                  position={[item.latitude, item.longitude]}
                  icon={createLocationIcon(item.business.name, selectedId === item.id)}
                  eventHandlers={{
                    click: () => {
                      onSelect(item);
                    }
                  }}
                >
                  <Popup>
                    <p>{item.address}</p>
                    {item.address2 && <p>{item.address2}</p>}
                  </Popup>
                </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
    )
}

export default ResourceMap;
