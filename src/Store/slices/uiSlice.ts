// UI slice for UI state management
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  sidebarCollapsed: boolean;
  theme: "light" | "dark";
  isLoading: boolean;
  modalOpen: string | null;
}

const initialState: UIState = {
  sidebarCollapsed: false,
  theme: (localStorage.getItem("theme") as "light" | "dark") || "light",
  isLoading: false,
  modalOpen: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.theme = action.payload;
      localStorage.setItem("theme", action.payload);
    },
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
      localStorage.setItem("theme", state.theme);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.modalOpen = action.payload;
    },
    closeModal: (state) => {
      state.modalOpen = null;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  setTheme,
  toggleTheme,
  setLoading,
  openModal,
  closeModal,
} = uiSlice.actions;
export default uiSlice.reducer;
