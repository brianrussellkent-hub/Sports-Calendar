import { NextResponse } from 'next/server';
import { getEvents } from '../../../lib/server/ingest.js';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') ?? '';
    const sports = (searchParams.get('sports') ?? '').split(',').filter(Boolean);
    const events = await getEvents({ search, sports });
    return NextResponse.json({ timezone: 'America/New_York', events });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
