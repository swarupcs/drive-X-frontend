import { useQuery } from "@tanstack/react-query";
import { fileService } from "@/services/file.service";
import { useAppSelector } from "@/store";

export function useRecentFiles() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  return useQuery({
    queryKey: ["recentFiles"],
    queryFn: () => fileService.getRecentFiles(),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}
