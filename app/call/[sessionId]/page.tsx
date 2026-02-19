"use client";

// This page reuses the CallPage component but loads an existing session
// For v1, redirect to main call page
// In v2, this loads session history and allows replay

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function SessionCallPage() {
  const router = useRouter();
  const { sessionId } = useParams();

  useEffect(() => {
    // TODO: Load existing session data and populate stores
    // For now, redirect to main call page
    console.log('[SessionCallPage] Session ID:', sessionId);
    router.push('/call');
  }, [sessionId, router]);

  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Loading session...</p>
    </div>
  );
}
