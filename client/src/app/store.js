import { configureStore } from '@reduxjs/toolkit';
import servantReducer from '../features/servant/servantSlice.js';
// import counterReducer from '../features/counter/counterSlice.js';

export default configureStore({
  reducer: {
    servants: servantReducer,
    // counter: counterReducer,
  },
});
