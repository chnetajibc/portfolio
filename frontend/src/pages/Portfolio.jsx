import { useState } from "react";
import InfoButton from "../components/InfoButton";
import ThemeToggle from "../components/ThemeToggle";
import ChatArea from "../components/ChatArea";
import SectionModal from "../components/SectionModal";
import InfoModal from "../components/InfoModal";
import HireFormModal from "../components/HireFormModal";
import Background from "../components/Background";
import Header from "../components/Header";
import LeftColumn from "../components/LeftColumn";
import Separator from "../components/Separator";

export default function Portfolio() {
  const [chatActive, setChatActive] = useState(false);
  const [sectionOpen, setSectionOpen] = useState(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [hireOpen, setHireOpen] = useState(false);

  const handlePromptAction = (action) => {
    if (action === "hire") {
      setHireOpen(true);
    } else {
      setSectionOpen(action);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden flex items-center justify-center">
      <Background />

      {/* Top-right controls */}
      <div className="fixed top-4 right-4 lg:top-6 lg:right-8 z-40 flex items-center gap-2">
        <ThemeToggle />
        <InfoButton onClick={() => setInfoOpen(true)} />
      </div>

      {/* Main content container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex flex-col">
        <Header />

        {/* Main content grid */}
        <div className="relative flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-8">
          <LeftColumn onSectionOpen={(id) => setSectionOpen(id)} />
          <Separator />
          <ChatArea active={chatActive} onActivate={() => setChatActive(true)} onPromptAction={handlePromptAction} big />
        </div>
      </div>

      <SectionModal openId={sectionOpen} onClose={() => setSectionOpen(null)} />
      <InfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
      <HireFormModal open={hireOpen} onClose={() => setHireOpen(false)} />
    </div>
  );
}
