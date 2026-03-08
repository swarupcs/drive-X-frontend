import { useQuery } from "@tanstack/react-query";
import { fileService } from "@/services/file.service";
import { useAppSelector } from "@/store";

export function useSharedFiles() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  return useQuery({
    queryKey: ["sharedFiles"],
    queryFn: () => fileService.getSharedFiles(),
    enabled: isAuthenticated,
    staleTime: 30_000,
  });
}
