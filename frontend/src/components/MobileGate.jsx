import React from "react";
import { motion } from "framer-motion";
import { Monitor } from "lucide-react";

export default function MobileGate() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 bg-[#0a0a0c] text-neutral-100 overflow-hidden">
      {/* Decorative stars */}
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: Math.random() * 1.5 + 0.5,
              height: Math.random() * 1.5 + 0.5,
              opacity: 0.4,
              animation: `twinkle ${Math.random() * 4 + 2}s ease-in-out ${Math.random() * 4}s infinite`,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-sm text-center"
      >
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-300 mb-6">
          <Monitor className="h-7 w-7" strokeWidth={2} />
        </div>
        <h1 className="font-display text-3xl font-semibold leading-tight">
          Best viewed on desktop.
        </h1>
        <p className="mt-3 text-[14px] text-neutral-400 leading-relaxed">
          This conversation-style portfolio is built for a wider canvas. Open it on a tablet or laptop to talk to me.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 text-[12px] font-mono text-neutral-500">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          waiting for you on the big screen
        </div>
      </motion.div>
    </div>
  );
}
