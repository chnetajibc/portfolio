import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Avatar from "../components/Avatar";
import InfoButton from "../components/InfoButton";
import ThemeToggle from "../components/ThemeToggle";
import ChatArea from "../components/ChatArea";
import QuickButtons from "../components/QuickButtons";
import SocialLinks from "../components/SocialLinks";
import SectionModal from "../components/SectionModal";
import InfoModal from "../components/InfoModal";
import StarField from "../components/StarField";
import Cosmos from "../components/Cosmos";
import DayMotif from "../components/DayMotif";
import MobileGate from "../components/MobileGate";
import { profile } from "../mock";
import { MapPin } from "lucide-react";

function renderBio(text) {
  const parts = text.split(/(\{blue\}[\s\S]*?\{\/blue\})/g);
  return parts.map((p, i) => {
    const m = p.match(/^\{blue\}([\s\S]*)\{\/blue\}$/);
    if (m) {
      return (
        <span key={i} className="text-blue-700 dark:text-blue-400 font-medium">
          {m[1]}
        </span>
      );
    }
    return <React.Fragment key={i}>{p}</React.Fragment>;
  });
}

export default function Portfolio() {
  const [chatActive, setChatActive] = useState(false);
  const [sectionOpen, setSectionOpen] = useState(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (isMobile) return <MobileGate />;

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Theme-aware decorative motifs */}
      <div className="hidden dark:block">
        <StarField count={56} className="opacity-90" />
        <Cosmos className="top-0 right-0" />
      </div>
      <div className="block dark:hidden">
        <DayMotif className="top-0 right-0" />
      </div>

      {/* Top-right controls */}
      <div className="absolute top-6 right-12 z-40 flex items-center gap-2">
        <ThemeToggle />
        <InfoButton onClick={() => setInfoOpen(true)} />
      </div>

      {/* HEADER — absolutely positioned so the name flows freely on one line.
          It visually overlaps the chat's top-right empty zone — no issue, that area is intentionally blank. */}
      <motion.header
        initial={{ y: 14, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55 }}
        className="absolute top-7 left-12 z-30 flex items-center gap-5"
      >
        <Avatar size={144} initials={profile.initials} />

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              available for work
            </span>
            <span className="text-neutral-300 dark:text-neutral-600">·</span>
            <span className="text-blue-700 dark:text-blue-400">~/netaji</span>
            <span className="text-neutral-400 dark:text-neutral-500">$</span>
            <span className="text-neutral-700 dark:text-neutral-300">whoami</span>
          </div>

          <h1
            className="font-display font-semibold text-neutral-900 dark:text-neutral-50 leading-[1.05] tracking-[-0.02em] mt-2 whitespace-nowrap overflow-hidden text-ellipsis"
            style={{ fontSize: "clamp(22px, 2.4vw, 38px)", maxWidth: "52vw" }}
          >
            {profile.name}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-neutral-600 dark:text-neutral-400" style={{ fontSize: "14px" }}>
            {profile.titles.map((t, i) => (
              <React.Fragment key={t}>
                <span className={i === 0 ? "text-blue-700 dark:text-blue-400 font-medium" : ""}>{t}</span>
                {i < profile.titles.length - 1 && <span className="text-neutral-300 dark:text-neutral-600">|</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </motion.header>

      {/* Two columns at FULL viewport height. Left has bio/jump-to/location below the header.
          Right has chat extending to the very top — overlapping the header's empty right side. */}
      <div className="grid grid-cols-[40fr_60fr] h-full relative z-10">
        {/* LEFT COLUMN */}
        <section className="pl-12 pr-6 py-7 flex flex-col min-h-0 overflow-hidden">
          {/* Reserve vertical space so the absolute header doesn't overlap the rest of the left content */}
          <div className="shrink-0" style={{ height: "200px" }} />

          {/* Socials */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <SocialLinks size="lg" />
          </motion.div>

          {/* Bio */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.55 }}
            className="max-w-[640px] mt-5"
          >
            <p className="leading-[1.7] text-neutral-700 dark:text-neutral-300 whitespace-pre-line" style={{ fontSize: "16px" }}>
              {renderBio(profile.bio)}
            </p>
          </motion.div>

          {/* Jump-to */}
          <div className="max-w-[640px] mt-6">
            <div className="text-[10.5px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400 mb-2 font-mono">
              // jump to
            </div>
            <QuickButtons onOpen={(id) => setSectionOpen(id)} big />
          </div>

          {/* Location */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-5 inline-flex items-center gap-2 text-[12.5px] font-mono text-neutral-500 dark:text-neutral-400 self-start"
          >
            <span className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-white/70 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-700/80">
              <MapPin className="h-3.5 w-3.5 text-blue-700 dark:text-blue-400" />
            </span>
            {profile.location}
          </motion.div>

          <div className="flex-1" />
        </section>

        {/* RIGHT COLUMN — full viewport height, chat starts from the very top */}
        <section className="pl-6 pr-12 py-7 flex flex-col min-h-0 relative">
          <div className="absolute -left-px top-7 bottom-7 w-px bg-gradient-to-b from-transparent via-neutral-300/70 dark:via-neutral-700/70 to-transparent" />
          <div className="flex-1 min-h-0 flex flex-col">
            <ChatArea active={chatActive} onActivate={() => setChatActive(true)} big />
          </div>
        </section>
      </div>

      <SectionModal openId={sectionOpen} onClose={() => setSectionOpen(null)} />
      <InfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
    </div>
  );
}
