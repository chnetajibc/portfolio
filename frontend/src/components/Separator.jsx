export default function Separator() {
  return (
    <>
      {/* Mobile — horizontal line */}
      <div className="lg:hidden h-px bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent" />

      {/* Desktop — centered vertical line */}
      <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
        <div className="w-0.5 h-48 bg-gradient-to-b from-transparent via-neutral-300 dark:via-neutral-700 to-transparent" />
      </div>
    </>
  );
}
