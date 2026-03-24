"use client";

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  0: SpeechRecognitionAlternativeLike;
  length: number;
}

interface SpeechRecognitionResultListLike {
  [index: number]: SpeechRecognitionResultLike;
  length: number;
}

interface SpeechRecognitionErrorEventLike {
  error: string;
}

interface SpeechRecognitionEventLike {
  results: SpeechRecognitionResultListLike;
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onstart: null | (() => void);
  onend: null | (() => void);
  onerror: null | ((event: SpeechRecognitionErrorEventLike) => void);
  onresult: null | ((event: SpeechRecognitionEventLike) => void);
  start(): void;
  stop(): void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export interface RecognitionCallbacks {
  onTranscript: (text: string) => void;
  onListeningChange?: (listening: boolean) => void;
  onError?: (message: string) => void;
}

export class BrowserSpeechRecognizer {
  private recognition: SpeechRecognitionLike | null = null;

  constructor(private callbacks: RecognitionCallbacks) {}

  isSupported() {
    return typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  start() {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      this.callbacks.onError?.("Speech recognition is not supported in this browser.");
      return;
    }

    this.recognition?.stop();
    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => this.callbacks.onListeningChange?.(true);
    recognition.onend = () => this.callbacks.onListeningChange?.(false);
    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => this.callbacks.onError?.(event.error);
    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      const result = Array.from({ length: event.results.length }, (_, index) => event.results[index])
        .map((entry) => entry[0]?.transcript ?? "")
        .join(" ")
        .trim();
      if (result) {
        this.callbacks.onTranscript(result);
      }
    };

    recognition.start();
    this.recognition = recognition;
  }

  stop() {
    this.recognition?.stop();
  }
}
