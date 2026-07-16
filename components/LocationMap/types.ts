export interface Location {
  id: string;
  address: string;
  address2?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  business: { name: string };
}

export function hasCoordinates<T extends Location>(item: T): item is T & { latitude: number; longitude: number } {
  return Number.isFinite(item.latitude) && Number.isFinite(item.longitude);
}
