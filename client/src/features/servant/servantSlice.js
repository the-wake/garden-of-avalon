import { createSlice } from '@reduxjs/toolkit';

export const servantSlice = createSlice({
  name: 'servants',
  initialState: {
    roster: JSON.parse(localStorage.getItem('roster')) || [],
  },
  reducers: {
    // select: (servant) => {
    //   state.servant = servant;
    // },
    // clear: () => {
    //   state.servant = null;
    // },
    addServant: (state, action) => {
      // This conditional doesn't work.
      if (!state.roster.includes(action.payload)) {
        state.roster.push(action.payload);
        localStorage.setItem('roster', JSON.stringify(state.roster));
      };
    },
    removeServant: (state, action) => {
      state.roster.filter((index) => action.payload !== index.collectionNo);
      localStorage.setItem('roster', JSON.stringify(state.roster));
    },
  },
});

export const { addServant, removeServant } = servantSlice.actions;

export default servantSlice.reducer;
