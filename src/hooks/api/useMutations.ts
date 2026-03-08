import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  addUpload,
  updateUploadProgress,
  setUploadStatus,
  setUploadError,
  cancelUpload,
  uploadAbortControllers,
  uploadFileStore,
} from "@/store/slices/uploadSlice";
import { setCredentials } from "@/store/slices/authSlice";
import { toast } from "sonner";
import { generateId } from "@/utils/fileHelpers";
import { fileService } from "@/services/file.service";
import { shareService } from "@/services/share.service";
import { adminService } from "@/services/admin.service";
import { authService } from "@/services/auth.service";
import type { FileLabel } from "@/types";

// ===================== AUTH MUTATIONS =====================

export function useUpdateProfile() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((s) => s.auth.user);
  const token = useAppSelector((s) => s.auth.token);

  return useMutation({
    mutationFn: (data: { name?: string; avatar?: string }) => authService.updateProfile(data),
    onSuccess: (user) => {
      if (token) {
        dispatch(setCredentials({ user, token }));
      }
      toast.success("Profile updated", { description: "Your profile has been updated." });
    },
    onError: (err: Error) => {
      toast.error("Error", { description: err.message });
    },
  });
}

// ===================== FILE MUTATIONS =====================

export function useCreateFolder(parentId: string | null) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => fileService.createFolder(name, parentId),
    onSuccess: (folder) => {
      qc.invalidateQueries({ queryKey: ["files", parentId ?? "root"] });
      qc.invalidateQueries({ queryKey: ["folders"] });
      toast.success("Folder created", { description: `"${folder.name}" has been created.` });
    },
    onError: (err: Error) => {
      toast.error("Error", { description: err.message });
    },
  });
}

export function useRenameItem() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => fileService.renameFile(id, name),
    onSuccess: (file) => {
      qc.invalidateQueries({ queryKey: ["files"] });
      qc.invalidateQueries({ queryKey: ["folders"] });
      toast.success("Renamed", { description: `Renamed to "${file.name}".` });
    },
    onError: (err: Error) => {
      toast.error("Error", { description: err.message });
    },
  });
}

export function useMoveItem() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, targetFolderId }: { id: string; targetFolderId: string | null }) =>
      fileService.moveFile(id, targetFolderId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["files"] });
      toast.success("Moved", { description: "Item has been moved." });
    },
    onError: (err: Error) => {
      toast.error("Error", { description: err.message });
    },
  });
}

export function useCopyItem() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, targetFolderId }: { id: string; targetFolderId: string | null }) =>
      fileService.copyFile(id, targetFolderId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["files"] });
      toast.success("Copied", { description: "Item has been copied." });
    },
    onError: (err: Error) => {
      toast.error("Error", { description: err.message });
    },
  });
}

export function useStarItem() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, starred }: { id: string; starred: boolean }) =>
      fileService.starFile(id, starred),
    onSuccess: (file, { starred }) => {
      qc.invalidateQueries({ queryKey: ["files"] });
      qc.invalidateQueries({ queryKey: ["starredFiles"] });
      toast.success(starred ? "Starred" : "Unstarred", { description: `"${file.name}" has been ${starred ? "starred" : "unstarred"}.` });
    },
    onError: (err: Error) => {
      toast.error("Error", { description: err.message });
    },
  });
}

export function useLabelItem() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, label }: { id: string; label: FileLabel | null }) =>
      fileService.labelFile(id, label),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["files"] });
    },
  });
}

export function useTrashItem() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => fileService.trashFile(id),
    onSuccess: (file) => {
      qc.invalidateQueries({ queryKey: ["files"] });
      qc.invalidateQueries({ queryKey: ["trashFiles"] });
      qc.invalidateQueries({ queryKey: ["starredFiles"] });
      toast.success("Moved to trash", {
        description: `"${file.name}" moved to trash.`,
        action: { label: "Undo", onClick: () => {} },
      });
    },
    onError: (err: Error) => {
      toast.error("Error", { description: err.message });
    },
  });
}

export function useRestoreItem() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => fileService.restoreFile(id),
    onSuccess: (file) => {
      qc.invalidateQueries({ queryKey: ["files"] });
      qc.invalidateQueries({ queryKey: ["trashFiles"] });
      toast.success("Restored", { description: `"${file.name}" has been restored.` });
    },
    onError: (err: Error) => {
      toast.error("Error", { description: err.message });
    },
  });
}

export function useDeletePermanently() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => fileService.deleteFilePermanently(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trashFiles"] });
      qc.invalidateQueries({ queryKey: ["storageInfo"] });
      toast.success("Deleted", { description: "Item permanently deleted." });
    },
    onError: (err: Error) => {
      toast.error("Error", { description: err.message });
    },
  });
}

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
const MAX_CONCURRENT_UPLOADS = 3;

async function runUpload(
  file: File,
  uploadId: string,
  parentId: string | null,
  dispatch: ReturnType<typeof useAppDispatch>
): Promise<import("@/types").FileItem> {
  const ctrl = new AbortController();
  uploadAbortControllers.set(uploadId, ctrl);
  uploadFileStore.set(uploadId, file);

  dispatch(addUpload({ id: uploadId, filename: file.name, size: file.size, folderId: parentId, progress: 0, status: "pending" }));

  try {
    const result = await fileService.uploadFile(file, parentId, (progress) => {
      dispatch(updateUploadProgress({ id: uploadId, progress }));
    }, ctrl.signal);
    dispatch(setUploadStatus({ id: uploadId, status: "done" }));
    uploadAbortControllers.delete(uploadId);
    return result;
  } catch (err) {
    uploadAbortControllers.delete(uploadId);
    if (ctrl.signal.aborted) {
      dispatch(cancelUpload(uploadId));
    } else {
      dispatch(setUploadError({ id: uploadId, message: err instanceof Error ? err.message : "Upload failed" }));
    }
    throw err;
  }
}

/** Upload a batch of files with concurrency limit and file-size validation. */
export function useUploadFiles(parentId: string | null) {
  const dispatch = useAppDispatch();
  const qc = useQueryClient();

  return useCallback(async (files: File[]) => {
    const toUpload: File[] = [];
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error("File too large", { description: `"${file.name}" exceeds the 100 MB limit.` });
      } else {
        toUpload.push(file);
      }
    }
    if (toUpload.length === 0) return;

    const queue = toUpload.map((file) => ({ file, id: generateId() }));
    let successCount = 0;

    const worker = async () => {
      while (queue.length > 0) {
        const item = queue.shift();
        if (!item) break;
        try {
          await runUpload(item.file, item.id, parentId, dispatch);
          successCount++;
        } catch {
          // errors handled inside runUpload
        }
      }
    };

    const workers = Array.from({ length: Math.min(MAX_CONCURRENT_UPLOADS, toUpload.length) }, worker);
    await Promise.all(workers);

    if (successCount > 0) {
      qc.invalidateQueries({ queryKey: ["files", parentId ?? "root"] });
      qc.invalidateQueries({ queryKey: ["storageInfo"] });
      qc.invalidateQueries({ queryKey: ["recentFiles"] });
    }
  }, [parentId, dispatch, qc]);
}

/** Retry a previously failed upload. */
export function useRetryUpload() {
  const dispatch = useAppDispatch();
  const qc = useQueryClient();

  return useCallback(async (uploadItem: import("@/types").UploadItem) => {
    const file = uploadFileStore.get(uploadItem.id);
    if (!file) {
      toast.error("Cannot retry", { description: "Original file is no longer available." });
      return;
    }
    // Reset progress
    dispatch(updateUploadProgress({ id: uploadItem.id, progress: 0 }));
    dispatch(setUploadStatus({ id: uploadItem.id, status: "pending" }));

    try {
      await runUpload(file, uploadItem.id, uploadItem.folderId, dispatch);
      qc.invalidateQueries({ queryKey: ["files", uploadItem.folderId ?? "root"] });
      qc.invalidateQueries({ queryKey: ["storageInfo"] });
      qc.invalidateQueries({ queryKey: ["recentFiles"] });
    } catch {
      // handled inside runUpload
    }
  }, [dispatch, qc]);
}

/** Single-file upload (kept for backward compat in DriveLayout). */
export function useUploadFile(parentId: string | null) {
  const uploadFiles = useUploadFiles(parentId);
  return { mutate: (file: File) => uploadFiles([file]) };
}

// ===================== SHARE MUTATIONS =====================

export function useShareFile() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ fileId, emails, permission }: { fileId: string; emails: string[]; permission: "viewer" | "commenter" | "editor" }) =>
      shareService.shareWithUsers(fileId, { emails, permission }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["files"] });
      toast.success("Shared", { description: "File has been shared." });
    },
    onError: (err: Error) => {
      toast.error("Error", { description: err.message });
    },
  });
}

export function useGenerateShareLink() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ fileId, permission, expiresAt }: { fileId: string; permission: "view" | "edit" | "restricted"; expiresAt?: string | null }) =>
      shareService.generateShareLink(fileId, { permission, expiresAt }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shareLinks"] });
      toast.success("Link generated", { description: "Share link has been created." });
    },
    onError: (err: Error) => {
      toast.error("Error", { description: err.message });
    },
  });
}

// Alias
export const useGenerateLink = useGenerateShareLink;

export function useToggleShareLink() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ linkId }: { linkId: string; fileId?: string }) =>
      shareService.toggleShareLink(linkId),
    onSuccess: (_, { fileId }) => {
      qc.invalidateQueries({ queryKey: ["shareLinks", fileId] });
      qc.invalidateQueries({ queryKey: ["shareLinks"] });
    },
  });
}

export function useRevokeShareLink() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (linkId: string) => shareService.revokeShareLink(linkId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["shareLinks"] });
      toast.success("Link revoked", { description: "Share link has been revoked." });
    },
    onError: (err: Error) => {
      toast.error("Error", { description: err.message });
    },
  });
}

// ===================== ADMIN MUTATIONS =====================

export function useAdminUpdateUser() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: { name?: string; storageQuota?: number; role?: string } }) =>
      adminService.updateUser(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminUsers"] });
      toast.success("User updated");
    },
    onError: (err: Error) => {
      toast.error("Error", { description: err.message });
    },
  });
}

export function useAdminSuspendUser() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, suspended }: { id: string; suspended: boolean }) =>
      adminService.suspendUser(id, suspended),
    onSuccess: (_user, { suspended }) => {
      qc.invalidateQueries({ queryKey: ["adminUsers"] });
      toast.success(suspended ? "User suspended" : "User activated");
    },
    onError: (err: Error) => {
      toast.error("Error", { description: err.message });
    },
  });
}

// Admin/Trash aliases
export const useDeleteItem = useDeletePermanently;
export const useSuspendUser = useAdminSuspendUser;

// Admin share link revocation (no file-specific cache invalidation)
export function useRevokeLink() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (linkId: string) => shareService.revokeShareLink(linkId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminShareLinks"] });
      toast.success("Link revoked", { description: "Share link has been revoked." });
    },
    onError: (err: Error) => {
      toast.error("Error", { description: err.message });
    },
  });
}
