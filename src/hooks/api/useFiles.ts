import { useQuery } from "@tanstack/react-query";
import { fileService } from "@/services/file.service";
import { useAppSelector } from "@/store";

export function useFiles(parentId?: string | null) {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  return useQuery({
    queryKey: ["files", parentId ?? "root"],
    queryFn: () => fileService.getFiles({ parentId: parentId ?? null }),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}

export function useSuggestedFiles() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  return useQuery({
    queryKey: ["suggestedFiles"],
    queryFn: () => fileService.getSuggestedFiles(),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}
