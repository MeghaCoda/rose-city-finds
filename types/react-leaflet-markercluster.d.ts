// react-leaflet-markercluster's package.json exports "./styles" straight to a
// .css file with no "types" condition, so it doesn't match Next's ambient
// `declare module '*.css'` (that wildcard matches the literal import
// specifier text, which here is "react-leaflet-markercluster/styles", not
// anything ending in ".css").
declare module "react-leaflet-markercluster/styles";
