import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  currency: 'USD' | 'NGN';
}

const initialState: SettingsState = {
  currency: 'USD',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setCurrency: (state, action: PayloadAction<'USD' | 'NGN'>) => {
      state.currency = action.payload;
    },
  },
});

export const { setCurrency } = settingsSlice.actions;
export default settingsSlice.reducer;
