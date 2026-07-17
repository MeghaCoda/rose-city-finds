import L from "leaflet";
import { PIN_WIDTH } from "./markerIcon";

// --- Label collision avoidance ------------------------------------------
//
// Leaflet.markercluster only prevents ICON overlap (by merging nearby pins
// into a cluster bubble); it has no opinion on the text LABELS next to
// those icons, so two pins that sit just outside clustering range but are
// still close on screen render overlapping name labels. Google Maps solves
// this the cheap way: labels are placed in priority order against a
// screen-space occupancy list, and any label that would collide is simply
// hidden (the icon stays; only the text goes) rather than physically
// repositioned. This module implements that; LabelCollisionController
// recomputes it only on zoomend/moveend, so cost is proportional to the
// number of currently-visible pins, not the full dataset.
export const LABEL_FONT = "600 11px system-ui, sans-serif";
const LABEL_HEIGHT = 16;
const LABEL_GAP = 4; // gap between the icon and the label, mirrors the old baked-in span
const LABEL_PADDING = 4; // horizontal buffer so adjacent labels don't feel cramped
const ICON_HALF_WIDTH = PIN_WIDTH / 2;

let labelMeasureContext: CanvasRenderingContext2D | null = null;
export function measureLabelWidth(text: string): number {
  if (!labelMeasureContext) {
    labelMeasureContext = document.createElement("canvas").getContext("2d");
  }
  if (!labelMeasureContext) return text.length * 7;
  labelMeasureContext.font = LABEL_FONT;
  return labelMeasureContext.measureText(text).width;
}

export interface ScreenLabel {
  id: string;
  point: L.Point;
  width: number;
}

export interface LabelBox {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export function boxesOverlap(a: LabelBox, b: LabelBox): boolean {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

// Cluster bubbles (leaflet.markercluster's own merged-pin icons) occupy
// screen space too, but they're not part of `labels` — they have no name to
// place. Read their rendered boxes straight from the DOM (scoped to this
// map's container) so a label can't land on top of one: a bubble is a
// "no room here" obstacle, not a competing label.
export function getClusterBubbleBoxes(map: L.Map): LabelBox[] {
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
export function computeVisibleLabelIds(labels: ScreenLabel[], obstacles: LabelBox[] = []): Set<string> {
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
