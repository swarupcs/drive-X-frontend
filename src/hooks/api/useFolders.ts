import { useQuery } from "@tanstack/react-query";
import { fileService } from "@/services/file.service";
import { useAppSelector } from "@/store";

export function useFolderTree() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  return useQuery({
    queryKey: ["folders"],
    queryFn: () => fileService.getFolderTree(),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}

export const useFolders = useFolderTree;
