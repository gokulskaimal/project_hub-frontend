import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UiState {
  isLoading: boolean;
}

const initialState: UiState = {
  isLoading: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    stopLoading(state) {
      state.isLoading = false;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const { startLoading, stopLoading, setLoading } = uiSlice.actions;
export default uiSlice.reducer;
