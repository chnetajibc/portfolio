import React from "react";
import { motion } from "framer-motion";
import { socials } from "../mock";
import {
  GithubIcon,
  LinkedinIcon,
  XIcon,
  MailIcon,
  LeetcodeIcon,
  DiscordIcon,
} from "./BrandIcons";

const iconMap = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  x: XIcon,
  mail: MailIcon,
  leetcode: LeetcodeIcon,
  discord: DiscordIcon,
};

export default function SocialLinks({ size = "md" }) {
  const dim = size === "sm" ? "h-9 w-9" : size === "lg" ? "h-11 w-11" : "h-10 w-10";
  const ic = size === "sm" ? "h-[15px] w-[15px]" : size === "lg" ? "h-[18px] w-[18px]" : "h-[16px] w-[16px]";
  const gap = size === "sm" ? "gap-2" : "gap-3.5";

  return (
    <div className={`flex ${gap} items-center`}>
      {socials.map((s, i) => {
        const Icon = iconMap[s.id] || MailIcon;
        const brand = s.color;
        return (
          <motion.a
            key={s.id}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.05 + i * 0.05 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.92 }}
            className={`group relative ${dim} rounded-xl flex items-center justify-center bg-white/85 dark:bg-neutral-900/70 border border-neutral-200/80 dark:border-neutral-700/80 hover:border-transparent transition-colors`}
          >
            <span
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: brand }}
            />
            <Icon
              className={`relative ${ic} text-neutral-800 dark:text-neutral-200 group-hover:text-white transition-colors`}
            />
          </motion.a>
        );
      })}
    </div>
  );
}
