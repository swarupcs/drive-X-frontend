import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UploadItem } from "@/types";

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
    removeUpload(state, action: PayloadAction<string>) {
      state.uploads = state.uploads.filter((u) => u.id !== action.payload);
    },
    clearCompletedUploads(state) {
      state.uploads = state.uploads.filter((u) => u.status !== "done");
    },
  },
});

export const { addUpload, updateUploadProgress, setUploadStatus, removeUpload, clearCompletedUploads } = uploadSlice.actions;
export default uploadSlice.reducer;
