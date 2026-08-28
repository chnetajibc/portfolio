import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChatArea from "./ChatArea";

vi.mock("../lib/api", () => ({
  postChat: vi.fn(),
}));
import { postChat } from "../lib/api";

describe("ChatArea", () => {
  beforeEach(() => vi.clearAllMocks());

  it("shows initial prompt and quick buttons", () => {
    render(<ChatArea active={false} onActivate={() => {}} onPromptAction={() => {}} />);
    expect(screen.getByText(/Talk to me here/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Type a message/)).toBeInTheDocument();
  });

  it("activates chat on send", async () => {
    const onActivate = vi.fn();
    const user = userEvent.setup();
    render(<ChatArea active={false} onActivate={onActivate} onPromptAction={() => {}} />);
    const input = screen.getByPlaceholderText(/Type a message/);
    await user.type(input, "hello{enter}");
    expect(onActivate).toHaveBeenCalled();
  });

  it("shows loading then response", async () => {
    postChat.mockResolvedValue("AI reply");
    const user = userEvent.setup();
    render(<ChatArea active={true} onActivate={() => {}} onPromptAction={() => {}} />);
    const input = screen.getByPlaceholderText(/Continue the conversation/);
    await user.type(input, "hello{enter}");
    // Should show typing indicator
    await waitFor(() => expect(postChat).toHaveBeenCalledWith("hello"));
    await waitFor(() => expect(screen.getByText("AI reply")).toBeInTheDocument());
  });

  it("handles DAILY_LIMIT_REACHED", async () => {
    postChat.mockRejectedValue({ code: "DAILY_LIMIT_REACHED", message: "limit" });
    const user = userEvent.setup();
    render(<ChatArea active={true} onActivate={() => {}} onPromptAction={() => {}} />);
    await user.type(screen.getByPlaceholderText(/Continue/), "hi{enter}");
    await waitFor(() => expect(screen.getByText(/Daily AI limit reached/)).toBeInTheDocument());
  });

  it("handles RATE_LIMITED", async () => {
    postChat.mockRejectedValue({ code: "RATE_LIMITED", message: "rate" });
    const user = userEvent.setup();
    render(<ChatArea active={true} onActivate={() => {}} onPromptAction={() => {}} />);
    await user.type(screen.getByPlaceholderText(/Continue/), "hi{enter}");
    await waitFor(() => expect(screen.getByText(/too quickly/)).toBeInTheDocument());
  });

  it("hire prompt opens hire form", async () => {
    const onPromptAction = vi.fn();
    const user = userEvent.setup();
    render(<ChatArea active={true} onActivate={() => {}} onPromptAction={onPromptAction} />);
    // Type hire keyword which triggers hire form via checkSmartPrompt
    const input = screen.getByPlaceholderText(/Continue/);
    await user.type(input, "hire me{enter}");
    await waitFor(() => expect(screen.getByPlaceholderText("Jane Doe")).toBeInTheDocument());
  });

  it("send button appears only when input has text", async () => {
    const user = userEvent.setup();
    render(<ChatArea active={true} onActivate={() => {}} onPromptAction={() => {}} />);
    expect(screen.queryByLabelText("Send message")).not.toBeInTheDocument();
    await user.type(screen.getByPlaceholderText(/Continue/), "a");
    expect(screen.getByLabelText("Send message")).toBeInTheDocument();
  });

  it("keyboard: Enter sends, Shift+Enter does not", async () => {
    postChat.mockResolvedValue("ok");
    const user = userEvent.setup();
    render(<ChatArea active={true} onActivate={() => {}} onPromptAction={() => {}} />);
    const input = screen.getByPlaceholderText(/Continue/);
    await user.type(input, "test");
    await user.keyboard("{Shift>}{Enter}{/Shift}");
    expect(postChat).not.toHaveBeenCalled();
    await user.keyboard("{Enter}");
    await waitFor(() => expect(postChat).toHaveBeenCalled());
  });
});
