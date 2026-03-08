import { useQuery } from "@tanstack/react-query";
import { fileService } from "@/services/file.service";
import { useAppSelector } from "@/store";

export function useStarredFiles() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  return useQuery({
    queryKey: ["starredFiles"],
    queryFn: () => fileService.getStarredFiles(),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}
