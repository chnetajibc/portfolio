import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { projects } from "../../mock";
import { Badge } from "../ui/badge";

export default function ProjectsList() {
  return (
    <div className="grid grid-cols-1 gap-3">
      {projects.map((p, i) => (
        <motion.a
          key={p.name}
          href={p.link}
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className="group block rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 hover:border-neutral-900/40 dark:hover:border-blue-400/50 transition-colors"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="font-display text-[15px] lg:text-[16px] font-semibold text-neutral-900 dark:text-neutral-50 min-w-0 truncate">{p.name}</div>
            <ExternalLink className="h-4 w-4 text-neutral-400 dark:text-neutral-500 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors shrink-0" />
          </div>
          <div className="text-[12px] lg:text-[12.5px] text-blue-700 dark:text-blue-400 font-medium">{p.tagline}</div>
          <p className="text-[12px] lg:text-[13px] text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">{p.description}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {p.keywords.map((k, idx) => (
              <Badge key={idx} variant="outline" className="font-mono text-[10px] lg:text-[10.5px] dark:border-neutral-700 dark:text-neutral-300">{k}</Badge>
            ))}
          </div>
        </motion.a>
      ))}
    </div>
  );
}
