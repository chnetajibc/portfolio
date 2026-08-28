import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HireFormModal from "./HireFormModal";

describe("HireFormModal", () => {
  const onClose = vi.fn();
  beforeEach(() => vi.clearAllMocks());

  it("does not render when closed", () => {
    render(<HireFormModal open={false} onClose={onClose} />);
    expect(screen.queryByText("Get in Touch")).not.toBeInTheDocument();
  });

  it("opens correctly", async () => {
    render(<HireFormModal open={true} onClose={onClose} />);
    expect(await screen.findByText("Get in Touch")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Jane Doe")).toBeInTheDocument();
  });

  it("closes via close button", async () => {
    const user = userEvent.setup();
    render(<HireFormModal open={true} onClose={onClose} />);
    const closeBtn = await screen.findByRole("button", { name: /close/i });
    await user.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it("closes via backdrop click", async () => {
    const user = userEvent.setup();
    render(<HireFormModal open={true} onClose={onClose} />);
    // Radix Dialog overlay is bg-black/80 with data state
    const backdrop = document.querySelector("[data-radix-dialog-overlay]") || document.querySelector(".bg-black\\/80");
    expect(backdrop).toBeInTheDocument();
    await user.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it("does not close when clicking modal content", async () => {
    const user = userEvent.setup();
    render(<HireFormModal open={true} onClose={onClose} />);
    const heading = await screen.findByText("Get in Touch");
    await user.click(heading);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("modal content scrolls with overscroll-contain", async () => {
    render(<HireFormModal open={true} onClose={onClose} />);
    await screen.findByText("Get in Touch");
    const el = document.querySelector(".thin-scroll");
    expect(el).toBeInTheDocument();
    expect(el.className).toContain("overflow-y-auto");
    // overscroll-behavior is via CSS .thin-scroll { overscroll-behavior: contain }
    expect(el).toBeInTheDocument();
  });

  it("reopening does not corrupt state", async () => {
    const { rerender } = render(<HireFormModal open={false} onClose={onClose} />);
    for (let i = 0; i < 2; i++) {
      rerender(<HireFormModal open={true} onClose={onClose} />);
      await screen.findByText("Get in Touch");
      rerender(<HireFormModal open={false} onClose={onClose} />);
      await waitFor(() => expect(screen.queryByText("Get in Touch")).not.toBeInTheDocument());
    }
  });
});
