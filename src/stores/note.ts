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
      state.notes.unshift(action.payload);
    },
    deleteNote: (state, action: PayloadAction<string>) => {
      const index = state.notes.findIndex(item => item.id === action.payload);
      if (index === -1) {
        return;
      }
      state.notes.splice(index, 1);
    },
    batchDeleteNotes: (state, action: PayloadAction<string[]>) => {
      const ids = new Set(action.payload);
      state.notes = state.notes.filter(item => !ids.has(item.id));
    },
    updateNote: (state, action: PayloadAction<Note>) => {
      const index = state.notes.findIndex(
        item => item.id === action.payload.id,
      );
      if (index === -1) {
        return;
      }
      state.notes[index] = action.payload;
    },
    setNoteList: (state, action: PayloadAction<Note[]>) => {
      state.notes = action.payload;
    },
  },
});

export const { addNote, deleteNote, batchDeleteNotes, updateNote, setNoteList } = noteSlice.actions;

export default noteSlice.reducer;
