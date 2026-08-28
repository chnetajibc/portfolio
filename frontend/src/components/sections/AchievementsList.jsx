import { motion } from "framer-motion";
import { achievements } from "../../mock";

export default function AchievementsList() {
  return (
    <div className="space-y-2.5">
      {achievements.map((a, i) => (
        <motion.div
          key={a.title}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-start gap-3 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3.5"
        >
          <div className="h-9 w-9 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center shrink-0 font-mono text-[11px]">
            {a.year}
          </div>
          <div className="min-w-0">
            <div className="font-display font-semibold text-[14px] lg:text-[14.5px] text-neutral-900 dark:text-neutral-50 truncate">{a.title}</div>
            <div className="text-[12px] lg:text-[13px] text-neutral-600 dark:text-neutral-400 mt-0.5">{a.detail}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
