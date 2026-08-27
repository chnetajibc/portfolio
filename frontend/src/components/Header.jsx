import React from "react";
import { motion } from "framer-motion";
import Avatar from "./Avatar";
import { profile } from "../mock";

export default function Header() {
  return (
    <motion.header
      initial={{ y: 14, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55 }}
      className="flex items-center gap-4 lg:gap-5 mb-6 lg:mb-8"
    >
      <div className="flex items-center gap-4 lg:gap-5">
        <span className="h-16 w-1 rounded-full bg-emerald-500 lg:hidden" />
        <div className="hidden lg:block">
          <Avatar size={80} initials={profile.initials} className="lg:size-[120px]" />
        </div>
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] lg:text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
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
          className="font-display font-semibold text-neutral-900 dark:text-neutral-50 leading-[1.05] tracking-[-0.02em] mt-2"
          style={{ fontSize: "clamp(22px, 2.4vw, 38px)" }}
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
  );
}
