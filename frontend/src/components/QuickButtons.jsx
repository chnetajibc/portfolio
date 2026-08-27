import React from "react";
import { motion } from "framer-motion";
import { Briefcase, FolderGit2, Wrench, Trophy, ArrowUpRight } from "lucide-react";
import sectionsData from "../data/sections.json";

const iconMap = {
  Briefcase,
  FolderGit2,
  Wrench,
  Trophy,
};

export default function QuickButtons({ onOpen, big = false }) {
  const padCls = big ? "px-4 py-4" : "px-3.5 py-3";
  const iconBoxCls = big ? "h-10 w-10" : "h-8 w-8";
  const iconCls = big ? "h-[18px] w-[18px]" : "h-4 w-4";
  const labelCls = big ? "text-[15px]" : "text-[14px]";
  const subCls = big ? "text-[12px]" : "text-[11px]";

  return (
    <div className="grid grid-cols-2 gap-2.5 w-full">
      {sectionsData.map((it, i) => {
        const Icon = iconMap[it.icon] || Briefcase;
        return (
          <motion.button
            key={it.id}
            type="button"
            onClick={() => onOpen(it.id)}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.18 + i * 0.05 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`group relative overflow-hidden text-left rounded-xl bg-white/70 dark:bg-neutral-900/60 backdrop-blur border border-neutral-200/80 dark:border-neutral-700/70 ${padCls} hover:border-neutral-900/30 dark:hover:border-blue-400/50 hover:bg-white dark:hover:bg-neutral-900/85 transition-all duration-300`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className={`${iconBoxCls} hidden lg:flex rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 items-center justify-center group-hover:bg-blue-700 dark:group-hover:bg-blue-500 group-hover:text-white dark:group-hover:text-white transition-colors`}>
                  <Icon className={iconCls} strokeWidth={2.2} />
                </span>
                <div>
                  <div className={`font-display font-semibold ${labelCls} text-neutral-900 dark:text-neutral-50 leading-tight`}>
                    {it.label}
                  </div>
                  <div className={`${subCls} font-mono text-neutral-500 dark:text-neutral-400 mt-0.5`}>{it.sub}</div>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-neutral-400 dark:text-neutral-500 group-hover:text-blue-700 dark:group-hover:text-blue-400 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}