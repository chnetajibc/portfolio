import { motion } from "framer-motion";
import { profile } from "../mock";
import { MapPin } from "lucide-react";

export default function Location() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mt-5 inline-flex items-center gap-2 text-[12px] lg:text-[12.5px] font-mono text-neutral-500 dark:text-neutral-400"
    >
      <span className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-white/70 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-700/80">
        <MapPin className="h-3.5 w-3.5 text-blue-700 dark:text-blue-400" />
      </span>
      {profile.location}
    </motion.div>
  );
}
