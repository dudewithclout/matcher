"use client";

export interface VoiceOption {
  name: string;
  lang: string;
  voiceURI: string;
}

export class SpeechSynthesisQueue {
  private synth = typeof window !== "undefined" ? window.speechSynthesis : null;

  getVoices(): VoiceOption[] {
    if (!this.synth) return [];
    return this.synth.getVoices().map((voice) => ({
      name: voice.name,
      lang: voice.lang,
      voiceURI: voice.voiceURI,
    }));
  }

  speak(text: string, voiceURI: string | null, onEnd?: () => void) {
    if (!this.synth) {
      onEnd?.();
      return;
    }

    this.synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = this.synth.getVoices().find((item) => item.voiceURI === voiceURI);
    if (voice) {
      utterance.voice = voice;
    }
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onend = () => onEnd?.();
    this.synth.speak(utterance);
  }

  stop() {
    this.synth?.cancel();
  }
}
