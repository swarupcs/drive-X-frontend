import { useQuery } from "@tanstack/react-query";
import { fileService } from "@/services/file.service";
import { useAppSelector } from "@/store";
import type { StorageInfo } from "@/services/file.service";

export function useStorageInfo() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  return useQuery<StorageInfo>({
    queryKey: ["storageInfo"],
    queryFn: () => fileService.getStorageInfo(),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}
