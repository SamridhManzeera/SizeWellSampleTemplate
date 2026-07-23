import { createSlice } from '@reduxjs/toolkit';

const common = createSlice({
  name: 'common',
  initialState: { token: null, projecttype: null },
  reducers: {
    updateAuthTokenRedux: (state, action) => ({
      ...state,
      token: action.payload.token,
      projecttype: action.payload.projecttype ?? null,
    }),
  },
});

export const { updateAuthTokenRedux } = common.actions;

export default common.reducer;
