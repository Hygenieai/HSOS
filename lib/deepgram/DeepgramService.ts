"use client";

// HYGENIE COPILOT — DEEPGRAM TRANSCRIPTION SERVICE
// Real-time speech-to-text via WebSocket
// Model: nova-2 with speaker diarization

export type DeepgramStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error' | 'closed';

export interface DeepgramTranscript {
  text: string;
  speaker: number;
  isFinal: boolean;
  confidence: number;
  words: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
    speaker: number;
  }>;
}

export type TranscriptCallback = (transcript: DeepgramTranscript) => void;
export type StatusCallback = (status: DeepgramStatus) => void;

export class DeepgramService {
  private socket: WebSocket | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private onTranscript: TranscriptCallback;
  private onStatus: StatusCallback;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private keepAliveInterval: NodeJS.Timeout | null = null;
  private apiKey: string = '';

  constructor(onTranscript: TranscriptCallback, onStatus: StatusCallback) {
    this.onTranscript = onTranscript;
    this.onStatus = onStatus;
  }

  async start(apiKey: string): Promise<void> {
    this.apiKey = apiKey;
    this.reconnectAttempts = 0;

    try {
      this.onStatus('connecting');

      // Get microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Connect to Deepgram WebSocket
      await this.connectWebSocket();
    } catch (error) {
      console.error('[Deepgram] Start error:', error);
      this.onStatus('error');
      throw error;
    }
  }

  private async connectWebSocket(): Promise<void> {
    const url = new URL('wss://api.deepgram.com/v1/listen');
    url.searchParams.set('model', 'nova-2');
    url.searchParams.set('language', 'en-US');
    url.searchParams.set('smart_format', 'true');
    url.searchParams.set('diarize', 'true');
    url.searchParams.set('interim_results', 'true');
    url.searchParams.set('utterance_end_ms', '1000');
    url.searchParams.set('vad_events', 'true');
    url.searchParams.set('encoding', 'opus');
    url.searchParams.set('sample_rate', '48000');

    this.socket = new WebSocket(url.toString(), ['token', this.apiKey]);

    this.socket.onopen = () => {
      console.log('[Deepgram] WebSocket connected');
      this.onStatus('connected');
      this.reconnectAttempts = 0;
      this.startKeepAlive();
      this.startMediaRecorder();
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'Results') {
          const alternative = data.channel?.alternatives?.[0];
          if (!alternative || !alternative.transcript) return;

          const transcript: DeepgramTranscript = {
            text: alternative.transcript,
            speaker: alternative.words?.[0]?.speaker ?? 0,
            isFinal: data.is_final === true,
            confidence: alternative.confidence || 0,
            words: alternative.words || [],
          };

          this.onTranscript(transcript);
        }
      } catch (error) {
        console.error('[Deepgram] Parse error:', error);
      }
    };

    this.socket.onerror = (error) => {
      console.error('[Deepgram] WebSocket error:', error);
      this.onStatus('error');
    };

    this.socket.onclose = (event) => {
      console.log('[Deepgram] WebSocket closed:', event.code, event.reason);
      this.stopKeepAlive();
      this.stopMediaRecorder();

      // Auto-reconnect with exponential backoff
      if (this.reconnectAttempts < this.maxReconnectAttempts && event.code !== 1000) {
        this.reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
        console.log(`[Deepgram] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
        this.onStatus('reconnecting');
        setTimeout(() => this.connectWebSocket(), delay);
      } else {
        this.onStatus('closed');
      }
    };
  }

  private startMediaRecorder(): void {
    if (!this.stream) return;

    try {
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && this.socket?.readyState === WebSocket.OPEN) {
          this.socket.send(event.data);
        }
      };

      this.mediaRecorder.start(250); // Send chunks every 250ms
    } catch (error) {
      console.error('[Deepgram] MediaRecorder error:', error);
      // Fallback for browsers that don't support opus
      try {
        this.mediaRecorder = new MediaRecorder(this.stream);
        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && this.socket?.readyState === WebSocket.OPEN) {
            this.socket.send(event.data);
          }
        };
        this.mediaRecorder.start(250);
      } catch (fallbackError) {
        console.error('[Deepgram] MediaRecorder fallback error:', fallbackError);
        this.onStatus('error');
      }
    }
  }

  private stopMediaRecorder(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (e) {
        // Ignore errors when stopping
      }
    }
    this.mediaRecorder = null;
  }

  private startKeepAlive(): void {
    this.stopKeepAlive();
    this.keepAliveInterval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'KeepAlive' }));
      }
    }, 10000); // Every 10 seconds
  }

  private stopKeepAlive(): void {
    if (this.keepAliveInterval) {
      clearInterval(this.keepAliveInterval);
      this.keepAliveInterval = null;
    }
  }

  stop(): void {
    // Close WebSocket gracefully
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: 'CloseStream' }));
      this.socket.close(1000, 'User ended call');
    }

    this.stopKeepAlive();
    this.stopMediaRecorder();

    // Stop microphone
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    this.socket = null;
    this.onStatus('closed');
  }

  getStatus(): DeepgramStatus {
    if (!this.socket) return 'idle';
    switch (this.socket.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'connected';
      case WebSocket.CLOSING: return 'closed';
      case WebSocket.CLOSED: return 'closed';
      default: return 'idle';
    }
  }
}
