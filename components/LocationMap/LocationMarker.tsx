"use client";
import L from "leaflet";
import { useMemo } from "react";
import { Marker, Popup, Tooltip } from "react-leaflet";
import { createLocationIcon } from "./markerIcon";
import { Location } from "./types";

interface LocationMarkerProps<T extends Location & { latitude: number; longitude: number }> {
  item: T;
  highlighted: boolean;
  onSelect: (item: T) => void;
  markerRefs: React.RefObject<Map<string, L.Marker>>;
  tooltipRefs: React.RefObject<Map<string, L.Tooltip>>;
}

export default function LocationMarker<T extends Location & { latitude: number; longitude: number }>({
  item,
  highlighted,
  onSelect,
  markerRefs,
  tooltipRefs,
}: LocationMarkerProps<T>) {
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
