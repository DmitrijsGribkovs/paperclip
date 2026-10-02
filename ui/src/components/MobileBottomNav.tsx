import { useMemo } from "react";
import { NavLink, useLocation } from "@/lib/router";
import {
  House,
  CircleCheck,
  SquarePen,
  Users,
  MessageSquare,
  Inbox,
} from "lucide-react";
import { useCompany } from "../context/CompanyContext";
import { useDialogActions } from "../context/DialogContext";
import { SIDEBAR_SCROLL_RESET_STATE } from "../lib/navigation-scroll";
import { cn } from "../lib/utils";
import { useInboxBadge } from "../hooks/useInboxBadge";
import { useAgentChatEnabled } from "@/hooks/useAgentChatEnabled";
import { useAgentChatV2Enabled } from "@/hooks/useAgentChatV2Enabled";
import { Badge } from "@/components/ui/badge";

interface MobileBottomNavProps {
  visible: boolean;
}

interface MobileNavLinkItem {
  type: "link";
  to: string;
  label: string;
  icon: typeof House;
  badge?: number;
}

interface MobileNavActionItem {
  type: "action";
  label: string;
  icon: typeof SquarePen;
  onClick: () => void;
}

type MobileNavItem = MobileNavLinkItem | MobileNavActionItem;

export function MobileBottomNav({ visible }: MobileBottomNavProps) {
  const location = useLocation();
  const { selectedCompanyId } = useCompany();
  const { openNewIssue } = useDialogActions();
  const inboxBadge = useInboxBadge(selectedCompanyId);
  const { enabled: agentChatEnabled } = useAgentChatEnabled();
  const { enabled: agentChatV2Enabled } = useAgentChatV2Enabled();

  // Agent Chat v2 (PAP-670): Home · Chat · + · Tasks · Agents. Inbox is gone as
  // a destination — it is a view inside Tasks, so its unread badge rides on
  // Tasks. Chat only appears when `enableAgentChat` is on too, and the grid
  // tracks the live count so the bar stays evenly divided either way. With v2
  // off the bar is the original Home · Tasks · + · Agents · Inbox.
  const items = useMemo<MobileNavItem[]>(
    () => !agentChatV2Enabled ? [
      { type: "link", to: "/dashboard", label: "Home", icon: House },
      { type: "link", to: "/issues", label: "Tasks", icon: CircleCheck },
      { type: "action", label: "New Task", icon: SquarePen, onClick: () => openNewIssue() },
      { type: "link", to: "/agents/all", label: "Agents", icon: Users },
      {
        type: "link",
        to: "/inbox",
        label: "Inbox",
        icon: Inbox,
        badge: inboxBadge.inbox,
      },
    ] : [
      { type: "link", to: "/dashboard", label: "Home", icon: House },
      ...(agentChatEnabled
        ? [{ type: "link", to: "/chats", label: "Chat", icon: MessageSquare } as MobileNavItem]
        : []),
      { type: "action", label: "New Task", icon: SquarePen, onClick: () => openNewIssue() },
      {
        type: "link",
        to: "/issues",
        label: "Tasks",
        icon: CircleCheck,
        badge: inboxBadge.inbox,
      },
      { type: "link", to: "/agents/all", label: "Agents", icon: Users },
    ],
    [openNewIssue, inboxBadge.inbox, agentChatEnabled, agentChatV2Enabled],
  );

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-30 bg-border/50 transition-transform duration-200 ease-out dark:bg-muted md:hidden pb-(--sz-safe-bottom)",
        visible ? "translate-y-0" : "translate-y-full",
      )}
      aria-label="Mobile navigation"
    >
      <div
        className="grid h-16 px-1"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((item) => {
          if (item.type === "action") {
            const Icon = item.icon;
            const active = /\/issues\/new(?:\/|$)/.test(location.pathname);
            return (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className={cn(
                  "relative flex min-w-0 flex-col items-center justify-center gap-1 rounded-md text-(length:--text-nano) font-medium transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-(--sz-18px) w-(--sz-18px)" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          }

          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.to}
              state={SIDEBAR_SCROLL_RESET_STATE}
              className={({ isActive }) =>
                cn(
                  "relative flex min-w-0 flex-col items-center justify-center gap-1 rounded-md text-(length:--text-nano) font-medium transition-colors",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative">
                    <Icon className={cn("h-(--sz-18px) w-(--sz-18px)", isActive && "stroke-(length:--sw-2_3)")} />
                    {item.badge != null && item.badge > 0 && (
                      <Badge variant="ghost" className="absolute -right-2 -top-2 bg-primary px-1.5 text-(length:--text-nano) leading-none text-primary-foreground">
                        {item.badge > 99 ? "99+" : item.badge}
                      </Badge>
                    )}
                  </span>
                  <span className="truncate">{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
