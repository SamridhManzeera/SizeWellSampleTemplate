import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type RequestFormModuleKey =
  | 'workArea'
  | 'it'
  | 'water'
  | 'welfare'
  | 'power'
  | 'workforce';

export interface RequestFormState {
  modules: Record<RequestFormModuleKey, boolean>;
  mobilisationDate: string;
  demobilisationDate: string;
}

export const REQUEST_FORM_INITIAL_STATE: RequestFormState = {
  modules: {
    workArea: false,
    it: false,
    water: false,
    welfare: false,
    power: false,
    workforce: false,
  },
  mobilisationDate: '',
  demobilisationDate: '',
};

const requestForm = createSlice({
  name: 'requestForm',
  initialState: REQUEST_FORM_INITIAL_STATE,
  reducers: {
    setModuleEnabled: (
      state,
      action: PayloadAction<{ module: RequestFormModuleKey; enabled: boolean }>
    ) => ({
      ...state,
      modules: {
        ...state.modules,
        [action.payload.module]: action.payload.enabled,
      },
    }),
    setMobilisationDate: (state, action: PayloadAction<string>) => ({
      ...state,
      mobilisationDate: action.payload,
    }),
    setDemobilisationDate: (state, action: PayloadAction<string>) => ({
      ...state,
      demobilisationDate: action.payload,
    }),
    resetRequestForm: () => REQUEST_FORM_INITIAL_STATE,
  },
});

export const {
  setModuleEnabled,
  setMobilisationDate,
  setDemobilisationDate,
  resetRequestForm,
} = requestForm.actions;

export default requestForm.reducer;
