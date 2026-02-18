import { NextResponse } from 'next/server';
import { getEvents } from '../../../lib/server/ingest.js';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') ?? '';
    const sports = (searchParams.get('sports') ?? '').split(',').filter(Boolean);
    const result = await getEvents({ search, sports });

    return NextResponse.json({
      timezone: 'America/New_York',
      events: result.events,
      warnings: result.warnings,
      usedSampleFallback: result.usedSampleFallback,
      lastRunAt: result.lastRunAt
    });
  } catch (error) {
    console.error('[api/events] failed to load events', error);
    const events = await getEvents({ search, sports });
    return NextResponse.json({ timezone: 'America/New_York', events });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
