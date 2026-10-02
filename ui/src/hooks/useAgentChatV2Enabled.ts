import { useContext } from "react";
import { QueryClient, QueryClientContext, useQuery } from "@tanstack/react-query";
import { instanceSettingsApi } from "@/api/instanceSettings";
import { queryKeys } from "@/lib/queryKeys";

let detachedClient: QueryClient | null = null;
function getDetachedClient(): QueryClient {
  detachedClient ??= new QueryClient();
  return detachedClient;
}

/**
 * Agent Chat v2 (Settings > Experimental): the reorganized left nav, Inbox as
 * views inside Tasks, the chat agent rail and the chat side panel's task and
 * artifact cards. Off by default — and off when rendered outside a query
 * client, as the app root is in some harnesses — so every surface renders as
 * before until an instance opts in.
 */
export function useAgentChatV2Enabled(): { enabled: boolean; loaded: boolean } {
  const contextClient = useContext(QueryClientContext);
  const query = useQuery(
    {
      queryKey: queryKeys.instance.experimentalSettings,
      queryFn: () => instanceSettingsApi.getExperimental(),
      enabled: contextClient != null,
    },
    contextClient ?? getDetachedClient(),
  );

  if (!contextClient) return { enabled: false, loaded: true };

  return {
    enabled: query.data?.enableAgentChatV2 === true,
    loaded: query.isFetched,
  };
}
