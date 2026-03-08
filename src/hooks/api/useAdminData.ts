import { useQuery } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
import { useAppSelector } from "@/store";

export function useAdminStats() {
  const isAdmin = useAppSelector((s) => s.auth.role === "admin");
  return useQuery({
    queryKey: ["adminStats"],
    queryFn: () => adminService.getDashboardStats(),
    enabled: isAdmin,
    staleTime: 60_000,
  });
}

export function useAdminUsers(page = 1, limit = 20) {
  const isAdmin = useAppSelector((s) => s.auth.role === "admin");
  return useQuery({
    queryKey: ["adminUsers", page, limit],
    queryFn: () => adminService.getAllUsers(page, limit),
    enabled: isAdmin,
    staleTime: 30_000,
  });
}

export function useAdminFiles(page = 1, limit = 50) {
  const isAdmin = useAppSelector((s) => s.auth.role === "admin");
  return useQuery({
    queryKey: ["adminFiles", page, limit],
    queryFn: () => adminService.getAllFiles(page, limit),
    enabled: isAdmin,
    staleTime: 30_000,
  });
}

export function useAdminShareLinks(page = 1, limit = 50) {
  const isAdmin = useAppSelector((s) => s.auth.role === "admin");
  return useQuery({
    queryKey: ["adminShareLinks", page, limit],
    queryFn: () => adminService.getAllShareLinks(page, limit),
    enabled: isAdmin,
    staleTime: 30_000,
  });
}

export function useAdminStorage() {
  const isAdmin = useAppSelector((s) => s.auth.role === "admin");
  return useQuery({
    queryKey: ["adminStorage"],
    queryFn: () => adminService.getStorageOverview(),
    enabled: isAdmin,
    staleTime: 60_000,
  });
}

export const useUsers = useAdminUsers;
export const useAllFiles = useAdminFiles;
export const useShareLinks = useAdminShareLinks;
