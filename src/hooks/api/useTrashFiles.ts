import { useQuery } from "@tanstack/react-query";
import { fileService } from "@/services/file.service";
import { useAppSelector } from "@/store";

export function useTrashFiles() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  return useQuery({
    queryKey: ["trashFiles"],
    queryFn: () => fileService.getTrashedFiles(),
    enabled: isAuthenticated,
    staleTime: 15_000,
  });
}
