import { renderHook, act, waitFor } from "@testing-library/react";
import useChat from "./useChat";

vi.mock("../lib/api", () => ({
  postChat: vi.fn(),
}));
import { postChat } from "../lib/api";

describe("useChat", () => {
  beforeEach(() => vi.clearAllMocks());

  it("initializes with empty state", () => {
    const { result } = renderHook(() => useChat({ active: false, onActivate: vi.fn(), onPromptAction: vi.fn() }));
    expect(result.current.input).toBe("");
    expect(result.current.currentUser).toBeNull();
    expect(result.current.isTyping).toBe(false);
  });

  it("sends message and handles success", async () => {
    postChat.mockResolvedValue("hello reply");
    const onActivate = vi.fn();
    const { result } = renderHook(() => useChat({ active: false, onActivate, onPromptAction: vi.fn() }));
    act(() => result.current.setInput("hello"));
    await act(async () => {
      await result.current.handleSend();
    });
    expect(onActivate).toHaveBeenCalled();
    await waitFor(() => expect(result.current.currentAi?.text).toBe("hello reply"));
  });

  it("sends hire keyword as normal message (no longer triggers hire form)", async () => {
    postChat.mockResolvedValue("Thanks for your interest!");
    const { result } = renderHook(() => useChat({ active: true, onActivate: vi.fn(), onPromptAction: vi.fn() }));
    act(() => result.current.setInput("hire me"));
    await act(async () => {
      await result.current.handleSend();
    });
    expect(postChat).toHaveBeenCalled();
    expect(result.current.showHireForm).toBe(false);
  });

  it("handles section keyword via onPromptAction", async () => {
    const onPromptAction = vi.fn();
    const { result } = renderHook(() => useChat({ active: true, onActivate: vi.fn(), onPromptAction }));
    act(() => result.current.setInput("experience"));
    await act(async () => {
      await result.current.handleSend();
    });
    expect(onPromptAction).toHaveBeenCalledWith("experience");
    expect(postChat).not.toHaveBeenCalled();
  });

  it("handles RATE_LIMITED error", async () => {
    postChat.mockRejectedValue({ code: "RATE_LIMITED", message: "Too many" });
    const { result } = renderHook(() => useChat({ active: true, onActivate: vi.fn(), onPromptAction: vi.fn() }));
    act(() => result.current.setInput("hi"));
    await act(async () => {
      await result.current.handleSend();
    });
    await waitFor(() => expect(result.current.currentAi?.text).toMatch(/too quickly/i));
  });
});
