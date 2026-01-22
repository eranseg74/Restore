import { createSlice } from "@reduxjs/toolkit";

const getInitialDarkMode = () => {
  const storedDarkMode = localStorage.getItem("darkMode");
  return storedDarkMode ? JSON.parse(storedDarkMode) : true;
};

export const uiSlice = createSlice({
  name: "ui",
  initialState: {
    isLoading: false,
    darkMode: getInitialDarkMode(),
  },
  reducers: {
    startLoading: (state) => {
      // No need for action here
      state.isLoading = true;
    },
    stopLoading: (state) => {
      // No need for action here
      state.isLoading = false;
    },
    toggleDarkMode: (state) => {
      localStorage.setItem("darkMode", JSON.stringify(!state.darkMode));
      state.darkMode = !state.darkMode;
    },
  },
});

export const { startLoading, stopLoading, toggleDarkMode } = uiSlice.actions;
