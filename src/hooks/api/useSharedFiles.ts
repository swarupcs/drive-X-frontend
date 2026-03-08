import { useQuery } from "@tanstack/react-query";
import { fileService } from "@/services/file.service";
import { shareService } from "@/services/share.service";
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

export function useFileShareLinks(fileId: string | null) {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  return useQuery({
    queryKey: ["shareLinks", fileId],
    queryFn: () => shareService.getFileShareLinks(fileId!),
    enabled: isAuthenticated && !!fileId,
    staleTime: 30_000,
  });
}
