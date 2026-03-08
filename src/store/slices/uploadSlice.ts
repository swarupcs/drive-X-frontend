import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UploadItem } from "@/types";

// Non-serializable: kept outside Redux state
export const uploadAbortControllers = new Map<string, AbortController>();
// Retaining File references for retry support
export const uploadFileStore = new Map<string, File>();

interface UploadState {
  uploads: UploadItem[];
}

const initialState: UploadState = {
  uploads: [],
};

const uploadSlice = createSlice({
  name: "upload",
  initialState,
  reducers: {
    addUpload(state, action: PayloadAction<UploadItem>) {
      state.uploads.push(action.payload);
    },
    updateUploadProgress(state, action: PayloadAction<{ id: string; progress: number }>) {
      const upload = state.uploads.find((u) => u.id === action.payload.id);
      if (upload) {
        upload.progress = action.payload.progress;
        if (action.payload.progress >= 100) {
          upload.status = "done";
        } else if (upload.status === "pending") {
          upload.status = "uploading";
        }
      }
    },
    setUploadStatus(state, action: PayloadAction<{ id: string; status: UploadItem["status"] }>) {
      const upload = state.uploads.find((u) => u.id === action.payload.id);
      if (upload) upload.status = action.payload.status;
    },
    setUploadError(state, action: PayloadAction<{ id: string; message: string }>) {
      const upload = state.uploads.find((u) => u.id === action.payload.id);
      if (upload) {
        upload.status = "error";
        upload.errorMessage = action.payload.message;
      }
    },
    removeUpload(state, action: PayloadAction<string>) {
      uploadAbortControllers.delete(action.payload);
      uploadFileStore.delete(action.payload);
      state.uploads = state.uploads.filter((u) => u.id !== action.payload);
    },
    cancelUpload(state, action: PayloadAction<string>) {
      const ctrl = uploadAbortControllers.get(action.payload);
      if (ctrl) {
        ctrl.abort();
        uploadAbortControllers.delete(action.payload);
      }
      uploadFileStore.delete(action.payload);
      state.uploads = state.uploads.filter((u) => u.id !== action.payload);
    },
    clearCompletedUploads(state) {
      state.uploads
        .filter((u) => u.status === "done" || u.status === "cancelled")
        .forEach((u) => {
          uploadAbortControllers.delete(u.id);
          uploadFileStore.delete(u.id);
        });
      state.uploads = state.uploads.filter(
        (u) => u.status !== "done" && u.status !== "cancelled"
      );
    },
  },
});

export const {
  addUpload,
  updateUploadProgress,
  setUploadStatus,
  setUploadError,
  removeUpload,
  cancelUpload,
  clearCompletedUploads,
} = uploadSlice.actions;
export default uploadSlice.reducer;
