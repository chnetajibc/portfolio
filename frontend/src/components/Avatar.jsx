import React from "react";
import { motion } from "framer-motion";

export default function Avatar({ size = 110, initials = "NBC", showRing = true, online = true }) {
  // Position the dot at ~5 o'clock on the avatar circle (about 14% inset from corner).
  const dotSize = Math.max(12, Math.round(size * 0.12));
  const dotInset = Math.round(size * 0.07);

  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 140, damping: 18 }}
      className="relative shrink-0"
      style={{ width: size, height: size }}
    >
      {showRing && (
        <motion.svg
          viewBox="0 0 120 120"
          className="absolute -inset-3 text-blue-700/55 dark:text-blue-400/60"
          animate={{ rotate: 360 }}
          transition={{ duration: 24, ease: "linear", repeat: Infinity }}
          aria-hidden
        >
          <circle
            cx="60"
            cy="60"
            r="56"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.7"
            strokeDasharray="2 6"
          />
        </motion.svg>
      )}

      <div
        className="avatar-shine absolute inset-0 rounded-full shadow-[0_18px_50px_-15px_rgba(0,0,0,0.6)]"
        aria-hidden
      />
      <div className="absolute inset-[3px] rounded-full bg-gradient-to-br from-neutral-900 to-black flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 120 120" className="absolute inset-0 opacity-[0.18]" aria-hidden>
          <g stroke="white" strokeWidth="0.4" fill="none">
            <circle cx="60" cy="60" r="28" />
            <circle cx="60" cy="60" r="44" />
            <line x1="0" y1="60" x2="120" y2="60" />
            <line x1="60" y1="0" x2="60" y2="120" />
          </g>
        </svg>
        <span
          className="font-display text-white/95 tracking-tight relative"
          style={{ fontSize: size * (initials.length === 1 ? 0.42 : 0.3), fontWeight: 600 }}
        >
          {initials}
        </span>
      </div>

      {online && (
        <span
          className="absolute rounded-full bg-emerald-500 ring-4 ring-[#f4f4f1] dark:ring-neutral-950"
          style={{
            width: dotSize,
            height: dotSize,
            right: dotInset,
            bottom: dotInset,
          }}
        >
          <span
            className="absolute inset-0 rounded-full bg-emerald-400"
            style={{ animation: "ping-soft 2.4s cubic-bezier(0,0,0.2,1) infinite" }}
          />
        </span>
      )}
    </motion.div>
  );
}
