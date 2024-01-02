import { configureStore } from '@reduxjs/toolkit';
import servantReducer from '../features/servant/servantSlice.js';
import noteReducer from '../features/note/noteSlice.js';

export default configureStore({
  reducer: {
    servants: servantReducer,
    note: noteReducer
  },
});
