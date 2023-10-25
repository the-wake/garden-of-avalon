import { createSlice } from '@reduxjs/toolkit';

// Just a sample component; not for use.
export const snapshotSlice = createSlice({
  name: 'snapshot',
  initialState: {
    sqSum: 0,
    txSum: 0
  },
  reducers: {
    adjustSq: (state, action) => {
      state.sqSum += action.payload;
    },
    adjustTx: (state, action) => {
      state.txSum += action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const { adjustSq, adjustTx } = snapshotSlice.actions;

export default snapshotSlice.reducer;
