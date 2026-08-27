import { motion } from "framer-motion";
import SocialLinks from "./SocialLinks";
import Bio from "./Bio";
import JumpTo from "./JumpTo";
import Location from "./Location";

export default function LeftColumn({ onSectionOpen }) {
  return (
    <section className="flex flex-col items-start gap-6 lg:gap-0 lg:justify-between h-auto lg:h-[550px] lg:py-1">
      {/* Socials */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <SocialLinks size="lg" className="flex flex-wrap" />
      </motion.div>

      <Bio />
      <JumpTo onSectionOpen={onSectionOpen} />
      <Location />
    </section>
  );
}
