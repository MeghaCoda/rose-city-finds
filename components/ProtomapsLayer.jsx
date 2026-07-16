"use client";
import { leafletLayer } from "protomaps-leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

// protomaps-leaflet 5.x's bundled style only matches unprefixed property
// names (kind, kind_detail) from tileset schema v4.0+. The v3 tile endpoint
// serves pmap:-prefixed properties instead, which silently fail every style
// filter — roads, landuse, and labels never draw, leaving only the
// unfiltered earth/water/building layers visible.
const TILE_URL = `https://api.protomaps.com/tiles/v4/{z}/{x}/{y}.mvt?key=${process.env.NEXT_PUBLIC_PROTOMAPS_API_KEY}`;

function ProtomapsLayer({ theme = "light" }) {
  const map = useMap();

  useEffect(() => {
    const layer = leafletLayer({ url: TILE_URL, flavor: theme });
    layer.addTo(map);
    return () => {
      map.removeLayer(layer);
    };
  }, [map, theme]);

  return null;
}

export default ProtomapsLayer;
