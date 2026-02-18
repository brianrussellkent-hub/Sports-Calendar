import { NextResponse } from 'next/server';
import { getConfig } from '../../../lib/server/config.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const config = await getConfig();
  return NextResponse.json(config);
}
