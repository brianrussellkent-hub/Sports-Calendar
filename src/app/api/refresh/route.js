import { NextResponse } from 'next/server';
import { refreshEvents } from '../../../lib/server/ingest.js';

export const runtime = 'nodejs';

function isAuthorized(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const auth = request.headers.get('authorization');
  return auth === `Bearer ${secret}`;
}

export async function GET(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await refreshEvents();
    return NextResponse.json({ message: 'Refreshed', count: result.events.length, lastRunAt: result.lastRunAt });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  return GET(request);
}
