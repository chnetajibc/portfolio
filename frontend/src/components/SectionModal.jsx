import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Briefcase, FolderGit2, Wrench, Trophy } from "lucide-react";
import sectionsData from "../data/sections.json";
import ExperienceList from "./sections/ExperienceList";
import ProjectsList from "./sections/ProjectsList";
import SkillsList from "./sections/SkillsList";
import AchievementsList from "./sections/AchievementsList";

const iconMap = {
  Briefcase,
  FolderGit2,
  Wrench,
  Trophy,
};

const contentMap = {
  experience: ExperienceList,
  projects: ProjectsList,
  skills: SkillsList,
  achievements: AchievementsList,
};

export default function SectionModal({ openId, onClose }) {
  const section = sectionsData.find((s) => s.id === openId) || null;
  const Icon = section ? iconMap[section.icon] : null;
  const Content = openId ? contentMap[openId] : null;

  return (
    <Dialog open={!!openId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl w-[92vw] max-h-[85vh] max-h-[85dvh] lg:max-h-[80vh] lg:max-h-[80dvh] p-0 gap-0 flex flex-col bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800">
        {section && Content && (
          <>
            <div className="shrink-0 px-4 lg:px-6 pt-4 lg:pt-6 pb-3 lg:pb-4 border-b border-neutral-200 dark:border-neutral-800 bg-gradient-to-br from-white to-blue-50/40 dark:from-neutral-900 dark:to-blue-950/30 rounded-t-lg">
              <DialogHeader>
                <div className="flex items-center gap-3 text-left">
                  <div className="h-10 w-10 rounded-xl bg-blue-700 dark:bg-blue-500 text-white flex items-center justify-center shadow-[0_6px_18px_-6px_rgba(37,99,235,0.55)]">
                    {Icon && <Icon className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0">
                    <DialogTitle className="font-display text-xl lg:text-2xl text-blue-700 dark:text-blue-400 truncate">{section.title}</DialogTitle>
                    <DialogDescription className="text-[12px] lg:text-[13px] text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">{section.subtitle}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
            </div>
            <div className="flex-1 overflow-y-auto thin-scroll px-4 lg:px-6 py-4 lg:py-5 min-h-0">
              <Content />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}