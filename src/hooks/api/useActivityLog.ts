import { useQuery } from "@tanstack/react-query";
import { activityService } from "@/services/activity.service";
import { useAppSelector } from "@/store";

export function useActivityLog(limit = 50, action?: string) {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  return useQuery({
    queryKey: ["activities", limit, action],
    queryFn: () => activityService.getActivities(limit, action),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}
