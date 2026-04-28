import React from "react";
import { motion } from "framer-motion";
import { Info } from "lucide-react";

export default function InfoButton({ onClick }) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      aria-label="About this site"
      className="h-10 w-10 rounded-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur border border-neutral-300 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-neutral-300 text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white flex items-center justify-center shadow-sm transition-colors"
    >
      <Info className="h-[18px] w-[18px]" strokeWidth={2.2} />
    </motion.button>
  );
}
