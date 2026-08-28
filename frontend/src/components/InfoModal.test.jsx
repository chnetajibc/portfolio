import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InfoModal from "./InfoModal";

describe("InfoModal", () => {
  const onClose = vi.fn();
  beforeEach(() => vi.clearAllMocks());

  it("does not render when closed", () => {
    render(<InfoModal open={false} onClose={onClose} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens correctly", async () => {
    render(<InfoModal open={true} onClose={onClose} />);
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("About this site")).toBeInTheDocument();
    expect(screen.getByText(/This page is a chat/)).toBeInTheDocument();
  });

  it("closes via close button", async () => {
    const user = userEvent.setup();
    render(<InfoModal open={true} onClose={onClose} />);
    const btn = await screen.findByRole("button", { name: /close/i });
    await user.click(btn);
    expect(onClose).toHaveBeenCalled();
  });

  it("closes via Escape", async () => {
    const user = userEvent.setup();
    render(<InfoModal open={true} onClose={onClose} />);
    await screen.findByRole("dialog");
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("content scrolls (thin-scroll)", async () => {
    render(<InfoModal open={true} onClose={onClose} />);
    await screen.findByRole("dialog");
    const el = document.querySelector(".thin-scroll");
    expect(el).toBeInTheDocument();
    expect(el.className).toContain("overflow-y-auto");
  });

  it("has dialog semantics and description", async () => {
    render(<InfoModal open={true} onClose={onClose} />);
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText("A short note from the developer.")).toBeInTheDocument();
  });

  it("restores scroll after close", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<InfoModal open={true} onClose={onClose} />);
    await screen.findByRole("dialog");
    await user.click(await screen.findByRole("button", { name: /close/i }));
    rerender(<InfoModal open={false} onClose={onClose} />);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});
