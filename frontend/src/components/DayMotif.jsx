import React, { useMemo } from "react";

// Light-theme decoration: dotted grid + git branches + floating code snippets.
// Reflects the "ship software by day" half of the bio.
export default function DayMotif({ className = "" }) {
  const codeLines = useMemo(
    () => [
      { text: "$ git checkout -b feature/heliograph", x: 64, y: 18, opacity: 0.34 },
      { text: "model.fit(X_train, y_train, epochs=10)", x: 38, y: 124, opacity: 0.30 },
      { text: "kubectl apply -f deployment.yaml", x: 70, y: 158, opacity: 0.26 },
      { text: "tensor.shape  // (32, 768)", x: 50, y: 192, opacity: 0.24 },
    ],
    []
  );

  return (
    <div className={`pointer-events-none absolute ${className}`} aria-hidden>
      {/* Soft gradient wash */}
      <div
        className="absolute rounded-full"
        style={{
          width: 420,
          height: 420,
          right: -120,
          top: -120,
          background:
            "radial-gradient(circle at 35% 35%, rgba(37, 99, 235, 0.10) 0%, rgba(37, 99, 235, 0.03) 40%, transparent 70%)",
          filter: "blur(8px)",
        }}
      />

      {/* Dotted grid */}
      <svg
        className="absolute"
        style={{ right: -40, top: -40, width: 540, height: 320 }}
        aria-hidden
      >
        <defs>
          <pattern id="dotgrid" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" className="fill-blue-700/30" />
          </pattern>
        </defs>
        <rect width="540" height="320" fill="url(#dotgrid)" />
      </svg>

      {/* Git branch graph */}
      <svg viewBox="0 0 240 90" className="absolute" style={{ right: 80, top: 30, width: 280, height: 100 }}>
        <g stroke="currentColor" strokeWidth="1.2" fill="none" className="text-blue-700/55">
          <path d="M 10 70 L 60 70 Q 80 70 80 50 L 80 30 Q 80 12 100 12 L 230 12" />
          <path d="M 10 70 L 230 70" />
          <path d="M 80 30 Q 80 50 100 50 L 230 50" />
        </g>
        <g className="fill-blue-700/80">
          <circle cx="40" cy="70" r="3" />
          <circle cx="120" cy="70" r="3" />
          <circle cx="200" cy="70" r="3" />
          <circle cx="120" cy="50" r="3" />
          <circle cx="200" cy="50" r="3" />
          <circle cx="140" cy="12" r="3" />
          <circle cx="220" cy="12" r="3" />
        </g>
      </svg>

      {/* Floating code snippets */}
      <div className="absolute inset-0">
        {codeLines.map((c, i) => (
          <span
            key={i}
            className="absolute font-mono text-[10.5px] text-blue-900 whitespace-nowrap"
            style={{ right: `${c.x}px`, top: `${c.y}px`, opacity: c.opacity }}
          >
            {c.text}
          </span>
        ))}
      </div>
    </div>
  );
}
