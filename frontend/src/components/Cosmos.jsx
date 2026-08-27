import React from "react";

// Inscribed cosmos: orbits, sun-glow, traveling planets.
// Uses CSS transforms (Tailwind spin keyframes) so animation survives theme toggles.
export default function Cosmos({ className = "" }) {
  // Each orbit: radius, planet color, orbit period (s), starting angle (deg).
  const orbits = [
    { r: 85, period: 28, color: "#f59e0b", phase: 45, size: 5 },
    { r: 110, period: 38, color: "#fbbf24", phase: 0, size: 6 },
    { r: 168, period: 58, color: "#fde68a", phase: 130, size: 4.5 },
    { r: 226, period: 78, color: "#fcd34d", phase: 220, size: 7 },
    { r: 285, period: 95, color: "#fef3c7", phase: 310, size: 5.5 },
  ];

  return (
    <div className={`pointer-events-none absolute ${className}`} aria-hidden>
      {/* Orbit container — moved further right; sun centered at its origin */}
      <div className="absolute" style={{ right: -10, top: 20, width: 0, height: 0 }}>
        {/* Sun glow — centered at 0,0 (same centre as rings), radius +15% */}
        <div
          className="absolute rounded-full"
          style={{
            width: 414,
            height: 414,
            left: -207,
            top: -207,
            background:
              "radial-gradient(circle at 35% 35%, rgba(253, 186, 116, 0.32) 0%, rgba(253, 186, 116, 0.10) 30%, transparent 65%)",
            filter: "blur(20px)",
          }}
        />
        {/* Static orbit rings — expanded viewBox to fit outer planet */}
        <svg
          viewBox="-310 -310 620 620"
          className="absolute"
          style={{ width: 620, height: 620, left: -310, top: -310 }}
        >
          <g stroke="currentColor" strokeWidth="0.6" fill="none" className="text-blue-700/30 dark:text-blue-400/25">
            {orbits.map((o) => (
              <circle key={o.r} cx="0" cy="0" r={o.r} />
            ))}
          </g>
        </svg>

        {/* Each rotating wrapper carries one planet */}
        {orbits.map((o, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: 0,
              top: 0,
              width: 0,
              height: 0,
              transform: `rotate(${o.phase}deg)`,
              animation: `spin ${o.period}s linear infinite`,
            }}
          >
            <div
              className="absolute rounded-full shadow-[0_0_12px_rgba(253,186,116,0.5)]"
              style={{
                background: o.color,
                width: o.size,
                height: o.size,
                left: o.r - o.size / 2,
                top: -o.size / 2,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
