/**
 * Agent Chat is available when either chat flag is on. Agent Chat v2 ships its
 * own chat surfaces (the Chat nav row, agent rail and side-panel cards), so it
 * must not depend on the classic Agent Chat flag — the two work independently.
 */
export function isAgentChatEnabled(
  settings: { enableAgentChat?: boolean | null; enableAgentChatV2?: boolean | null } | null | undefined,
): boolean {
  return settings?.enableAgentChat === true || settings?.enableAgentChatV2 === true;
}
