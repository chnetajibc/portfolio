import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { motion } from "framer-motion";
import { Briefcase, FolderGit2, Wrench, Trophy, ExternalLink, MapPin, Calendar } from "lucide-react";
import { experience, projects, skills, achievements } from "../mock";
import { Badge } from "./ui/badge";

const META = {
  experience: { title: "Experience", subtitle: "Roles, teams and the dents I've made.", Icon: Briefcase },
  projects: { title: "Projects", subtitle: "Things I built and shipped.", Icon: FolderGit2 },
  skills: { title: "Skills", subtitle: "My toolbox — honest about levels.", Icon: Wrench },
  achievements: { title: "Achievements", subtitle: "Awards, talks, certifications, patents.", Icon: Trophy },
};

function ExperienceList() {
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
            <div>
              <div className="font-display text-[16px] font-semibold text-neutral-900 dark:text-neutral-50">{e.role}</div>
              <div className="text-[13px] text-blue-700 dark:text-blue-400 font-medium">{e.company}</div>
            </div>
            <div className="flex items-center gap-3 text-[12px] text-neutral-500 dark:text-neutral-400 font-mono">
              <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {e.period}</span>
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {e.location}</span>
            </div>
          </div>
          <p className="text-[13.5px] text-neutral-700 dark:text-neutral-300 mt-1.5">{e.summary}</p>
          <ul className="mt-2 space-y-1">
            {e.highlights.map((h, idx) => (
              <li key={idx} className="text-[13px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                <span className="text-blue-700 dark:text-blue-400 mr-1.5">—</span>{h}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {e.stack.map((s) => (
              <Badge key={s} variant="secondary" className="font-mono text-[11px] dark:bg-neutral-800 dark:text-neutral-200">{s}</Badge>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ProjectsList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {projects.map((p, i) => (
        <motion.a
          key={p.id}
          href={p.link}
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className="group block rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 hover:border-neutral-900/40 dark:hover:border-blue-400/50 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="font-display text-[16px] font-semibold text-neutral-900 dark:text-neutral-50">{p.name}</div>
            <ExternalLink className="h-4 w-4 text-neutral-400 dark:text-neutral-500 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors" />
          </div>
          <div className="text-[12.5px] text-blue-700 dark:text-blue-400 font-medium">{p.tagline}</div>
          <p className="text-[13px] text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">{p.description}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {p.stack.map((s) => (
              <Badge key={s} variant="outline" className="font-mono text-[10.5px] dark:border-neutral-700 dark:text-neutral-300">{s}</Badge>
            ))}
          </div>
          {p.metrics?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {p.metrics.map((m, idx) => (
                <span key={idx} className="text-[11.5px] font-mono text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-md">{m}</span>
              ))}
            </div>
          )}
        </motion.a>
      ))}
    </div>
  );
}

function SkillsList() {
  return (
    <div className="space-y-5">
      {skills.map((g, gi) => (
        <motion.div key={g.group} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: gi * 0.06 }}>
          <div className="text-[12px] uppercase tracking-[0.18em] text-neutral-700 dark:text-neutral-200 mb-2 font-semibold">{g.group}</div>
          <div className="space-y-2">
            {g.items.map((it, idx) => (
              <div key={it.name}>
                <div className="flex justify-between text-[13px] mb-1">
                  <span className="text-neutral-800 dark:text-neutral-100 font-medium">{it.name}</span>
                  <span className="text-neutral-500 dark:text-neutral-400 font-mono text-[11.5px]">{it.level}%</span>
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

function AchievementsList() {
  return (
    <div className="space-y-2.5">
      {achievements.map((a, i) => (
        <motion.div
          key={a.id}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-start gap-3 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3.5"
        >
          <div className="h-9 w-9 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center shrink-0 font-mono text-[11px]">
            {a.year}
          </div>
          <div>
            <div className="font-display font-semibold text-[14.5px] text-neutral-900 dark:text-neutral-50">{a.title}</div>
            <div className="text-[13px] text-neutral-600 dark:text-neutral-400 mt-0.5">{a.detail}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function SectionModal({ openId, onClose }) {
  const meta = openId ? META[openId] : null;
  const Icon = meta?.Icon;

  return (
    <Dialog open={!!openId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl w-[92vw] max-h-[80vh] p-0 gap-0 flex flex-col bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800">
        {meta && (
          <>
            <div className="shrink-0 px-6 pt-6 pb-4 border-b border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-white to-blue-50/40 dark:from-neutral-900 dark:to-blue-950/30 rounded-t-lg">
              <DialogHeader>
                <div className="flex items-center gap-3 text-left">
                  <div className="h-10 w-10 rounded-xl bg-blue-700 dark:bg-blue-500 text-white flex items-center justify-center shadow-[0_6px_18px_-6px_rgba(37,99,235,0.55)]">
                    {Icon && <Icon className="h-5 w-5" />}
                  </div>
                  <div>
                    <DialogTitle className="font-display text-2xl text-blue-700 dark:text-blue-400">{meta.title}</DialogTitle>
                    <DialogDescription className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-0.5">{meta.subtitle}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
            </div>
            <div className="flex-1 overflow-y-auto thin-scroll px-6 py-5 min-h-0">
              {openId === "experience" && <ExperienceList />}
              {openId === "projects" && <ProjectsList />}
              {openId === "skills" && <SkillsList />}
              {openId === "achievements" && <AchievementsList />}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
