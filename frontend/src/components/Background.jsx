import StarField from "./StarField";
import Cosmos from "./Cosmos";
import DayMotif from "./DayMotif";

export default function Background() {
  return (
    <>
      <div className="hidden dark:block fixed inset-0 pointer-events-none z-0">
        <StarField count={56} className="opacity-90" />
        <Cosmos className="top-0 right-0" />
      </div>
      <div className="hidden lg:block dark:hidden fixed inset-0 pointer-events-none z-0">
        <DayMotif className="top-0 right-0" />
      </div>
    </>
  );
}
