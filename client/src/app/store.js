import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice.js';
import servantReducer from '../features/servant/servantSlice.js';

export default configureStore({
  reducer: {
    counter: counterReducer,
    servants: servantReducer,
  },
});
