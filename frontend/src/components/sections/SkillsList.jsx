import { motion } from "framer-motion";
import { skills } from "../../mock";

export default function SkillsList() {
  return (
    <div className="space-y-5">
      {skills.map((g, gi) => (
        <motion.div key={g.group} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: gi * 0.06 }}>
          <div className="text-[11px] lg:text-[12px] uppercase tracking-[0.18em] text-neutral-700 dark:text-neutral-200 mb-2 font-semibold">{g.group}</div>
          <div className="space-y-2">
            {g.items.map((it, idx) => (
              <div key={it.name}>
                <div className="flex justify-between text-[12px] lg:text-[13px] mb-1">
                  <span className="text-neutral-800 dark:text-neutral-100 font-medium">{it.name}</span>
                  <span className="text-neutral-500 dark:text-neutral-400 font-mono text-[11px] lg:text-[11.5px]">{it.level}%</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${it.level}%` }}
                    transition={{ duration: 0.9, delay: 0.1 + idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full bg-gradient-to-r from-blue-700 to-blue-400 dark:from-blue-700/85 dark:to-blue-600/75"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
