"use client";
import { MapContainer } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-markercluster/styles';
import "./LocationMap.css";
import L from "leaflet";
import { useRef } from "react";
import ProtomapsLayer from "@/components/ProtomapsLayer";
import { FALLBACK_CENTER, FALLBACK_ZOOM } from "./constants";
import InitialViewController from "./InitialViewController";
import LabelCollisionController from "./LabelCollisionController";
import LocationMarker from "./LocationMarker";
import ResizeController from "./ResizeController";
import SelectionController from "./SelectionController";
import { hasCoordinates, Location } from "./types";

export type { Location };

interface ResourceMapProps<T extends Location> {
  onSelect: (a: T) => void;
  data: T[];
  selectedId?: string | null;
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
          <InitialViewController data={data} />
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
