import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Simple in-memory rate limit for MVP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 50; // requests per hour per user
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour in ms

export async function POST(request: NextRequest) {
  try {
    // 1. Verify auth via Supabase JWT
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const token = authHeader.replace('Bearer ', '');
    let { data: { user }, error } = await supabase.auth.getUser(token);

    // Retry once after 500ms if auth state isn't resolved yet
    if (error || !user) {
      await new Promise((r) => setTimeout(r, 500));
      ({ data: { user }, error } = await supabase.auth.getUser(token));
    }

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // 2. Rate limiting (50 requests/hour/user)
    const now = Date.now();
    const userLimit = rateLimitMap.get(user.id);

    if (userLimit) {
      if (now > userLimit.resetAt) {
        // Reset window
        rateLimitMap.set(user.id, { count: 1, resetAt: now + RATE_WINDOW });
      } else if (userLimit.count >= RATE_LIMIT) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Try again later.' },
          { status: 429 }
        );
      } else {
        userLimit.count++;
      }
    } else {
      rateLimitMap.set(user.id, { count: 1, resetAt: now + RATE_WINDOW });
    }

    // 3. Return Deepgram API key
    const deepgramKey = process.env.DEEPGRAM_API_KEY;
    if (!deepgramKey) {
      return NextResponse.json(
        { error: 'Deepgram API key not configured' },
        { status: 503 }
      );
    }

    // TODO: Use Deepgram temporary key API instead of raw key for production
    return NextResponse.json({
      key: deepgramKey,
      expires_at: new Date(now + 3600000).toISOString(), // 1 hour
    });
  } catch (error: any) {
    console.error('[deepgram-token] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal error' },
      { status: 500 }
    );
  }
}
