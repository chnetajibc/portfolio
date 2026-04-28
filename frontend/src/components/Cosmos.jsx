import React from "react";

// Inscribed cosmos: orbits, sun-glow, traveling planets.
// Uses CSS transforms (Tailwind spin keyframes) so animation survives theme toggles.
export default function Cosmos({ className = "" }) {
  // Each orbit: radius, planet color, orbit period (s), starting angle (deg).
  const orbits = [
    { r: 110, period: 38, color: "#fbbf24", phase: 0, size: 6 },
    { r: 168, period: 58, color: "#fde68a", phase: 130, size: 4.5 },
    { r: 226, period: 78, color: "#fcd34d", phase: 220, size: 7 },
  ];

  return (
    <div className={`pointer-events-none absolute ${className}`} aria-hidden>
      {/* Sun glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: 360,
          height: 360,
          right: -120,
          top: -120,
          background:
            "radial-gradient(circle at 35% 35%, rgba(253, 186, 116, 0.32) 0%, rgba(253, 186, 116, 0.10) 30%, transparent 65%)",
          filter: "blur(20px)",
        }}
      />

      {/* Orbit container — centred at top-right, planets revolve around it */}
      <div className="absolute" style={{ right: -50, top: -60, width: 0, height: 0 }}>
        {/* Static orbit rings */}
        <svg
          viewBox="-260 -260 520 520"
          className="absolute"
          style={{ width: 520, height: 520, left: -260, top: -260 }}
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
