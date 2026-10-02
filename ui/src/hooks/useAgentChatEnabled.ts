import { useQuery } from "@tanstack/react-query";
import { isAgentChatEnabled } from "@paperclipai/shared";
import { instanceSettingsApi } from "@/api/instanceSettings";
import { queryKeys } from "@/lib/queryKeys";
/** True when either Agent Chat or Agent Chat v2 is on; they work independently. */
export function useAgentChatEnabled() {
  const query = useQuery({
    queryKey: queryKeys.instance.experimentalSettings,
    queryFn: () => instanceSettingsApi.getExperimental(),
  });
  return {
    enabled: isAgentChatEnabled(query.data),
    loaded: query.isFetched,
  };
}
