import L from "leaflet";

// Leaflet's default marker icon references image paths that break under
// Next.js's bundler; point the *default* icon (not the custom ones below,
// which every marker in this app actually uses) at the CDN copies instead.
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
export const PIN_WIDTH = 12;
export const PIN_HEIGHT = 18;
const HIGHLIGHT_PIN_WIDTH = PIN_WIDTH * 1.5;
const HIGHLIGHT_PIN_HEIGHT = PIN_HEIGHT * 1.5;

// The name label is rendered as a separate Leaflet Tooltip (see
// LocationMarker) rather than baked into this icon, so the icon itself
// never changes when a label is shown/hidden by labelCollision.ts's
// collision-avoidance pass.
export function createLocationIcon(highlighted: boolean) {
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
