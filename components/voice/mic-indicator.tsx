"use client";

interface MicIndicatorProps {
  status: "idle" | "listening" | "thinking" | "speaking";
}

export function MicIndicator({ status }: MicIndicatorProps) {
  return (
    <div className={`mic-indicator mic-${status}`}>
      <span className="mic-dot" />
      <span className="mic-label">
        {status === "idle" && "Ready"}
        {status === "listening" && "Listening"}
        {status === "thinking" && "Thinking"}
        {status === "speaking" && "Speaking"}
      </span>
    </div>
  );
}
