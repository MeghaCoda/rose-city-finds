import type { NextRequest } from 'next/server';
import { getLocations } from './service';

export async function GET(_req: NextRequest) {
  try {
    const locations = await getLocations();
    return Response.json(locations);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
