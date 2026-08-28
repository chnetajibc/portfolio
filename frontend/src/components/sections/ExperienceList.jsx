import { motion } from "framer-motion";
import { Calendar, MapPin } from "lucide-react";
import { experience } from "../../mock";
import { Badge } from "../ui/badge";

export default function ExperienceList() {
  return (
    <div className="space-y-4">
      {experience.map((e, i) => (
        <motion.div
          key={e.id}
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: i * 0.06 }}
          className="relative pl-5 border-l-2 border-neutral-200 dark:border-neutral-800"
        >
          <span className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-blue-700 dark:bg-blue-500 ring-4 ring-white dark:ring-neutral-950" />
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="font-display text-[15px] lg:text-[16px] font-semibold text-neutral-900 dark:text-neutral-50 truncate">{e.role}</div>
              <div className="text-[12px] lg:text-[13px] text-blue-700 dark:text-blue-400 font-medium truncate">{e.company}</div>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[11px] lg:text-[12px] text-neutral-500 dark:text-neutral-400 font-mono">
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {e.period}</span>
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {e.location}</span>
            </div>
          </div>
          <p className="text-[13px] lg:text-[13.5px] text-neutral-700 dark:text-neutral-300 mt-1.5">{e.summary}</p>
          <ul className="mt-2 space-y-1">
            {e.highlights.map((h, idx) => (
              <li key={idx} className="text-[12px] lg:text-[13px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                <span className="text-blue-700 dark:text-blue-400 mr-1.5">•</span>{h}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {e.stack.map((s) => (
              <Badge key={s} variant="secondary" className="font-mono text-[10px] lg:text-[11px] dark:bg-neutral-800 dark:text-neutral-200">{s}</Badge>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
