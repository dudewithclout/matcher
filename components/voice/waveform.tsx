"use client";

interface WaveformProps {
  active: boolean;
}

export function Waveform({ active }: WaveformProps) {
  return (
    <div className="waveform" aria-hidden="true" data-active={active}>
      {Array.from({ length: 18 }).map((_, index) => (
        <span key={index} style={{ animationDelay: `${index * 0.08}s` }} />
      ))}
    </div>
  );
}
