import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HireForm from "./HireForm";

// Mock api module
vi.mock("../lib/api", () => ({
  postContact: vi.fn(),
}));

import { postContact } from "../lib/api";

describe("HireForm", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders inputs", () => {
    render(<HireForm />);
    expect(screen.getByPlaceholderText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("jane@company.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/A sentence or two/)).toBeInTheDocument();
  });

  it("has honeypot hidden field", () => {
    render(<HireForm />);
    const honey = document.querySelector('input[name="website"]');
    expect(honey).toBeInTheDocument();
    expect(honey.className).toContain("hidden");
    expect(honey).toHaveAttribute("tabIndex", "-1");
  });

  it("validates required fields", async () => {
    const user = userEvent.setup();
    render(<HireForm />);
    const btn = screen.getByRole("button", { name: /send/i });
    await user.click(btn);
    expect(postContact).not.toHaveBeenCalled();
  });

  it("submits and shows success", async () => {
    const user = userEvent.setup();
    postContact.mockResolvedValue({ message: "ok" });
    render(<HireForm />);
    await user.type(screen.getByPlaceholderText("Jane Doe"), "John Doe");
    await user.type(screen.getByPlaceholderText("jane@company.com"), "john@example.com");
    await user.type(screen.getByPlaceholderText(/A sentence/), "Hello world");
    await user.click(screen.getByRole("button", { name: /send/i }));
    await waitFor(() => expect(postContact).toHaveBeenCalledWith(expect.objectContaining({ name: "John Doe", email: "john@example.com" })));
    await waitFor(() => expect(screen.getByText(/Thanks, John/)).toBeInTheDocument());
  });

  it("shows error on validation failure", async () => {
    const user = userEvent.setup();
    postContact.mockRejectedValue({ code: "VALIDATION_ERROR", message: "Invalid email" });
    render(<HireForm />);
    await user.type(screen.getByPlaceholderText("Jane Doe"), "John");
    await user.type(screen.getByPlaceholderText("jane@company.com"), "john@example.com");
    await user.type(screen.getByPlaceholderText(/A sentence/), "msg");
    await user.click(screen.getByRole("button", { name: /send/i }));
    await waitFor(() => expect(screen.getByText("Invalid email")).toBeInTheDocument());
  });

  it("shows rate limited error", async () => {
    const user = userEvent.setup();
    postContact.mockRejectedValue({ code: "RATE_LIMITED", message: "Too many" });
    render(<HireForm />);
    await user.type(screen.getByPlaceholderText("Jane Doe"), "John");
    await user.type(screen.getByPlaceholderText("jane@company.com"), "a@b.com");
    await user.type(screen.getByPlaceholderText(/A sentence/), "msg");
    await user.click(screen.getByRole("button", { name: /send/i }));
    await waitFor(() => expect(screen.getByText(/too quickly/i)).toBeInTheDocument());
  });

  it("is keyboard accessible", async () => {
    const user = userEvent.setup();
    render(<HireForm />);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByPlaceholderText("Jane Doe"));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByPlaceholderText("jane@company.com"));
  });
});
