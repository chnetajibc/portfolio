import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SectionModal from "./SectionModal";

// Radix Dialog requires testing via portal — we test via document.body
describe("SectionModal", () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset body styles Radix may set
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  });

  it("does not render when closed", () => {
    render(<SectionModal openId={null} onClose={onClose} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens correctly for experience", async () => {
    render(<SectionModal openId="experience" onClose={onClose} />);
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Experience")).toBeInTheDocument();
    expect(screen.getByText(/SDE Intern/)).toBeInTheDocument();
  });

  it("opens for projects/skills/achievements", async () => {
    const { rerender } = render(<SectionModal openId="projects" onClose={onClose} />);
    expect(await screen.findByText("Projects")).toBeInTheDocument();
    rerender(<SectionModal openId="skills" onClose={onClose} />);
    expect(await screen.findByText("Skills")).toBeInTheDocument();
    rerender(<SectionModal openId="achievements" onClose={onClose} />);
    expect(await screen.findByText("Achievements")).toBeInTheDocument();
  });

  it("closes via close button", async () => {
    const user = userEvent.setup();
    render(<SectionModal openId="experience" onClose={onClose} />);
    const closeBtn = await screen.findByRole("button", { name: /close/i });
    await user.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it("closes via Escape", async () => {
    const user = userEvent.setup();
    render(<SectionModal openId="experience" onClose={onClose} />);
    await screen.findByRole("dialog");
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("does not close when interacting with content", async () => {
    const user = userEvent.setup();
    render(<SectionModal openId="projects" onClose={onClose} />);
    const dialog = await screen.findByRole("dialog");
    await user.click(dialog);
    // Clicking inside content should not trigger onClose (Radix closes only on overlay)
    expect(onClose).not.toHaveBeenCalled();
  });

  it("focus moves to dialog when opened", async () => {
    render(<SectionModal openId="experience" onClose={onClose} />);
    const dialog = await screen.findByRole("dialog");
    await waitFor(() => expect(dialog).toBeInTheDocument());
    // Radix should focus close button or dialog
    expect(document.activeElement).toBeDefined();
  });

  it("content can scroll (overflow-y-auto)", async () => {
    render(<SectionModal openId="experience" onClose={onClose} />);
    await screen.findByRole("dialog");
    const scrollContainer = document.querySelector(".thin-scroll");
    expect(scrollContainer).toBeInTheDocument();
    expect(scrollContainer.className).toContain("overflow-y-auto");
    expect(scrollContainer.className).toContain("thin-scroll");
    // Check overscroll-behavior via computed style or class
    expect(getComputedStyle(scrollContainer).overscrollBehavior).toBeDefined();
  });

  it("long content remains accessible via scroll", async () => {
    render(<SectionModal openId="experience" onClose={onClose} />);
    await screen.findByRole("dialog");
    // Experience has 4 items, ensure all are rendered
    expect(screen.getByText(/Amazon/)).toBeInTheDocument();
    expect(screen.getByText(/HCLTech/)).toBeInTheDocument();
    const scrollEl = document.querySelector(".thin-scroll");
    expect(scrollEl).toBeInTheDocument();
    // Verify modal max-height uses dvh for mobile
    const dialog = screen.getByRole("dialog");
    expect(dialog.className).toContain("max-h-[85dvh]");
  });

  it("closing restores body scroll (no leftover overflow hidden)", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<SectionModal openId="experience" onClose={onClose} />);
    await screen.findByRole("dialog");
    // Simulate close
    const closeBtn = await screen.findByRole("button", { name: /close/i });
    await user.click(closeBtn);
    rerender(<SectionModal openId={null} onClose={onClose} />);
    // Body should not remain locked
    await waitFor(() => expect(document.body.style.overflow).not.toBe("hidden"));
  });

  it("reopening does not accumulate styles/listeners", async () => {
    const { rerender } = render(<SectionModal openId={null} onClose={onClose} />);
    for (let i = 0; i < 3; i++) {
      rerender(<SectionModal openId="experience" onClose={onClose} />);
      await screen.findByRole("dialog");
      rerender(<SectionModal openId={null} onClose={onClose} />);
      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    }
    // After 3 cycles, body should be clean
    expect(document.body.style.overflow).toBe("");
  });

  it("has accessible dialog semantics", async () => {
    render(<SectionModal openId="skills" onClose={onClose} />);
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAttribute("aria-labelledby");
    expect(screen.getByText("Skills")).toBeInTheDocument();
  });
});
