import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ViewMode, SortField, SortOrder, FilterType } from "@/types";

interface UiState {
  selectedFiles: string[];
  viewMode: ViewMode;
  sidebarCollapsed: boolean;
  searchQuery: string;
  sortBy: SortField;
  sortOrder: SortOrder;
  filterType: FilterType;
  activePanel: string | null;
  currentFolderId: string | null;
}

const initialState: UiState = {
  selectedFiles: [],
  viewMode: (localStorage.getItem("drivex-viewMode") as ViewMode) || "grid",
  sidebarCollapsed: false,
  searchQuery: "",
  sortBy: "name",
  sortOrder: "asc",
  filterType: "all",
  activePanel: null,
  currentFolderId: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleFileSelection(state, action: PayloadAction<string>) {
      const idx = state.selectedFiles.indexOf(action.payload);
      if (idx >= 0) {
        state.selectedFiles.splice(idx, 1);
      } else {
        state.selectedFiles.push(action.payload);
      }
    },
    setSelectedFiles(state, action: PayloadAction<string[]>) {
      state.selectedFiles = action.payload;
    },
    clearSelection(state) {
      state.selectedFiles = [];
    },
    setViewMode(state, action: PayloadAction<ViewMode>) {
      state.viewMode = action.payload;
      localStorage.setItem("drivex-viewMode", action.payload);
    },
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setSortBy(state, action: PayloadAction<SortField>) {
      state.sortBy = action.payload;
    },
    setSortOrder(state, action: PayloadAction<SortOrder>) {
      state.sortOrder = action.payload;
    },
    setFilterType(state, action: PayloadAction<FilterType>) {
      state.filterType = action.payload;
    },
    setActivePanel(state, action: PayloadAction<string | null>) {
      state.activePanel = action.payload;
    },
    setCurrentFolderId(state, action: PayloadAction<string | null>) {
      state.currentFolderId = action.payload;
    },
  },
});

export const {
  toggleFileSelection,
  setSelectedFiles,
  clearSelection,
  setViewMode,
  toggleSidebar,
  setSidebarCollapsed,
  setSearchQuery,
  setSortBy,
  setSortOrder,
  setFilterType,
  setActivePanel,
  setCurrentFolderId,
} = uiSlice.actions;
export default uiSlice.reducer;
