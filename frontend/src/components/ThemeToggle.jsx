import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <motion.button
      onClick={toggle}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="h-10 w-10 rounded-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur border border-neutral-300 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-neutral-300 text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white flex items-center justify-center shadow-sm transition-colors"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="sun"
            initial={{ rotate: -45, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 45, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Sun className="h-[18px] w-[18px]" strokeWidth={2.2} />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ rotate: 45, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -45, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Moon className="h-[18px] w-[18px]" strokeWidth={2.2} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
