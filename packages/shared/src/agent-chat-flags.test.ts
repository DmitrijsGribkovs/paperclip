import { describe, expect, it } from "vitest";
import { isAgentChatEnabled } from "./agent-chat-flags.js";

describe("isAgentChatEnabled", () => {
  it("is on when either chat flag is on, independently", () => {
    expect(isAgentChatEnabled({ enableAgentChat: true, enableAgentChatV2: false })).toBe(true);
    expect(isAgentChatEnabled({ enableAgentChat: false, enableAgentChatV2: true })).toBe(true);
    expect(isAgentChatEnabled({ enableAgentChat: true, enableAgentChatV2: true })).toBe(true);
  });

  it("is off when both flags are off or settings are missing", () => {
    expect(isAgentChatEnabled({ enableAgentChat: false, enableAgentChatV2: false })).toBe(false);
    expect(isAgentChatEnabled({})).toBe(false);
    expect(isAgentChatEnabled(undefined)).toBe(false);
  });
});
