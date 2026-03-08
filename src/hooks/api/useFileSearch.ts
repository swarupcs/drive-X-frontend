import { useQuery } from "@tanstack/react-query";
import { fileService } from "@/services/file.service";
import { useAppSelector } from "@/store";

export function useFileSearch(query: string) {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  return useQuery({
    queryKey: ["fileSearch", query],
    queryFn: () => fileService.getFiles({ search: query }),
    enabled: isAuthenticated && query.trim().length >= 2,
    staleTime: 15_000,
  });
}
