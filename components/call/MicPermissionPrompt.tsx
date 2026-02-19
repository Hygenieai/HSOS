"use client";

import { Mic, MicOff, RefreshCw, AlertCircle } from 'lucide-react';

interface MicPermissionPromptProps {
  error: string;
  onRetry: () => void;
}

export function MicPermissionPrompt({ error, onRetry }: MicPermissionPromptProps) {
  const isDenied = error.toLowerCase().includes('denied') ||
    error.toLowerCase().includes('permission') ||
    error.toLowerCase().includes('not allowed') ||
    error.toLowerCase().includes('notallowederror');

  return (
    <div className="flex flex-col items-center justify-center h-full px-8 text-center">
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
        {isDenied ? (
          <MicOff className="h-8 w-8 text-red-400" />
        ) : (
          <AlertCircle className="h-8 w-8 text-amber-400" />
        )}
      </div>

      <h3 className="text-lg font-semibold text-foreground mb-2">
        {isDenied ? 'Microphone Access Needed' : 'Connection Error'}
      </h3>

      <p className="text-sm text-muted-foreground mb-4 max-w-md">
        {isDenied
          ? "Copilot needs microphone access to transcribe your sales calls. Without it, there's nothing to coach on."
          : error
        }
      </p>

      {isDenied && (
        <div className="bg-card border border-border rounded-lg p-4 mb-6 text-left max-w-sm">
          <p className="text-xs font-medium text-foreground mb-2">To enable microphone access:</p>
          <ol className="text-xs text-muted-foreground space-y-1.5">
            <li>1. Click the lock/site settings icon in your browser address bar</li>
            <li>2. Find "Microphone" and set it to "Allow"</li>
            <li>3. Refresh the page or click the button below</li>
          </ol>
        </div>
      )}

      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-4 py-2 bg-[#F4845F] text-white rounded-lg hover:bg-[#e6734e] transition-colors text-sm font-medium"
      >
        <RefreshCw className="h-4 w-4" />
        {isDenied ? 'Try Again' : 'Retry Connection'}
      </button>
    </div>
  );
}
