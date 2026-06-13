import {createSlice} from '@reduxjs/toolkit';
import type {PayloadAction} from '@reduxjs/toolkit';
import type {QuickCopyItem} from '@/interface';

interface QuickCopyState {
  list: QuickCopyItem[];
}

const initialState: QuickCopyState = {
  list: [],
};

export const quickCopySlice = createSlice({
  name: 'quickCopy',
  initialState,
  reducers: {
    addQuickCopy: (state, action: PayloadAction<QuickCopyItem>) => {
      state.list.unshift(action.payload);
    },
    updateQuickCopy: (state, action: PayloadAction<QuickCopyItem>) => {
      const index = state.list.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
    },
    deleteQuickCopy: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter(item => item.id !== action.payload);
    },
    reorderQuickCopy: (state, action: PayloadAction<QuickCopyItem[]>) => {
      state.list = action.payload;
    },
    setQuickCopyList: (state, action: PayloadAction<QuickCopyItem[]>) => {
      state.list = action.payload;
    },
  },
});

export const {
  addQuickCopy,
  updateQuickCopy,
  deleteQuickCopy,
  reorderQuickCopy,
  setQuickCopyList,
} = quickCopySlice.actions;

export default quickCopySlice.reducer;
