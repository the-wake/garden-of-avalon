import { createSlice } from '@reduxjs/toolkit';

export const noteSlice = createSlice({
  name: 'note',
  initialState: {
    activeNote: ''
  },
  reducers: {
    updateNote: (state, action) => {
      state.activeNote = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { updateNote } = noteSlice.actions;

export default noteSlice.reducer;
