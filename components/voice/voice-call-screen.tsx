"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "../../lib/api";
import { BrowserSpeechRecognizer } from "../../lib/voice/speech-recognition";
import { SpeechSynthesisQueue, type VoiceOption } from "../../lib/voice/speech-synthesis-queue";
import type { InterviewSession } from "../../shared/types";
import { MicIndicator } from "./mic-indicator";
import { Waveform } from "./waveform";

export function VoiceCallScreen() {
  const router = useRouter();
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [status, setStatus] = useState<"idle" | "listening" | "thinking" | "speaking">("idle");
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastTranscript, setLastTranscript] = useState("");
  const [currentAssistantText, setCurrentAssistantText] = useState("");
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);

  const recognizerRef = useRef<BrowserSpeechRecognizer | null>(null);
  const ttsRef = useRef<SpeechSynthesisQueue | null>(null);

  useEffect(() => {
    const tts = new SpeechSynthesisQueue();
    ttsRef.current = tts;

    const recognizer = new BrowserSpeechRecognizer({
      onTranscript: async (text) => {
        setLastTranscript(text);
        if (!session) return;

        try {
          setStatus("thinking");
          const response = await api.sendInterviewMessage(session.id, text);
          setSession(response.session);
          setCurrentAssistantText(response.text);
          setStatus("speaking");
          tts.speak(response.text, selectedVoice, async () => {
            if (response.session.interviewComplete) {
              router.push(`/results?sessionId=${response.session.id}`);
              return;
            }
            setStatus("listening");
            recognizer.start();
          });
        } catch (caughtError) {
          setStatus("idle");
          setError(caughtError instanceof Error ? caughtError.message : "Something went wrong.");
        }
      },
      onListeningChange: (listening) => {
        setStatus((current) => (current === "speaking" || current === "thinking" ? current : listening ? "listening" : "idle"));
      },
      onError: (message) => setError(message),
    });

    recognizerRef.current = recognizer;
    setSupported(recognizer.isSupported());

    const populateVoices = () => {
      const available = tts.getVoices();
      setVoices(available);
      if (!selectedVoice && available[0]) {
        setSelectedVoice(available[0].voiceURI);
      }
    };

    populateVoices();
    if (typeof window !== "undefined") {
      window.speechSynthesis.onvoiceschanged = populateVoices;
    }

    return () => {
      recognizer.stop();
      tts.stop();
    };
  }, [router, selectedVoice, session]);

  const latestTurns = useMemo(() => session?.transcript.slice(-4) ?? [], [session]);

  const startInterview = async () => {
    try {
      setError(null);
      const response = await api.startInterview();
      setSession(response.session);
      setCurrentAssistantText(response.openingPrompt);
      setStatus("speaking");
      ttsRef.current?.speak(response.openingPrompt, selectedVoice, () => {
        setStatus("listening");
        recognizerRef.current?.start();
      });
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to start interview.");
    }
  };

  return (
    <section className="call-shell">
      <div className="call-header">
        <p className="eyebrow">Voice-first college interview</p>
        <h1>Your AI counselor call</h1>
        <p className="subtle">
          Speak naturally. The interviewer listens, follows up, and builds your college fit profile in real time.
        </p>
      </div>

      <div className="call-panel">
        <div className="call-top-row">
          <MicIndicator status={status} />
          <label className="voice-select">
            <span>AI voice</span>
            <select value={selectedVoice ?? ""} onChange={(event) => setSelectedVoice(event.target.value || null)}>
              {voices.map((voice) => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </label>
        </div>

        <Waveform active={status === "listening" || status === "speaking"} />

        <div className="assistant-bubble">
          <p className="assistant-label">Counselor</p>
          <p>{currentAssistantText || "Press start and your counselor will call you."}</p>
        </div>

        <div className="transcript-debug">
          <div>
            <span className="mini-label">Latest transcript</span>
            <p>{lastTranscript || "Your spoken reply will appear here while we process it."}</p>
          </div>
          <div>
            <span className="mini-label">Interview progress</span>
            <p>{latestTurns.length ? `${session?.transcript.filter((turn) => turn.role === "user").length ?? 0} student responses captured` : "No interview yet."}</p>
          </div>
        </div>

        {!session && (
          <button className="primary-button" onClick={startInterview} disabled={!supported}>
            Start Interview
          </button>
        )}

        {session && status === "idle" && (
          <button className="primary-button" onClick={() => recognizerRef.current?.start()}>
            Resume Listening
          </button>
        )}

        {!supported && <p className="warning">Your browser does not support Web Speech recognition. Chrome works best for this demo.</p>}
        {error && <p className="warning">{error}</p>}
      </div>
    </section>
  );
}
