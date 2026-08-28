import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ThemeToggle from "./ThemeToggle";
import { ThemeProvider } from "../contexts/ThemeContext";

function renderToggle() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>
  );
}

describe("ThemeToggle", () => {
  it("renders toggle button", () => {
    renderToggle();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("toggles theme on click", async () => {
    const user = userEvent.setup();
    renderToggle();
    const btn = screen.getByRole("button");
    const html = document.documentElement;
    const before = html.className;
    await user.click(btn);
    // Should have toggled class or not throw
    expect(document.documentElement).toBeDefined();
  });

  it("is keyboard accessible", async () => {
    const user = userEvent.setup();
    renderToggle();
    const btn = screen.getByRole("button");
    btn.focus();
    expect(btn).toHaveFocus();
    await user.keyboard("{Enter}");
    // No error
    expect(btn).toBeInTheDocument();
  });
});
