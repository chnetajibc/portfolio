import QuickButtons from "./QuickButtons";

export default function JumpTo({ onSectionOpen }) {
  return (
    <div className="mt-6">
      <div className="text-[10px] lg:text-[10.5px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400 mb-2 font-mono">
        // jump to
      </div>
      <QuickButtons onOpen={onSectionOpen} big />
    </div>
  );
}
