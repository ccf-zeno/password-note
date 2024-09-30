import {createSlice} from '@reduxjs/toolkit';
import type {PayloadAction} from '@reduxjs/toolkit';
import type {Note} from '@/interface';

interface NoteState {
  notes: Note[];
}

const initialState: NoteState = {
  notes: [],
};

export const noteSlice = createSlice({
  name: 'note',
  initialState,
  reducers: {
    addNote: (state, action: PayloadAction<Note>) => {
      state.notes.push(action.payload);
    },
    deleteNote: (state, action: PayloadAction<string>) => {
      const index = state.notes.findIndex(item => (item.id = action.payload));
      if (index === -1) {
        return;
      }
      state.notes.splice(index, 1);
    },
    updateNote: (state, action: PayloadAction<Note>) => {
      const index = state.notes.findIndex(
        item => (item.id = action.payload.id),
      );
      if (index === -1) {
        return;
      }
      state.notes[index] = action.payload;
    },
  },
});

export const {addNote, deleteNote, updateNote} = noteSlice.actions;

export default noteSlice.reducer;
