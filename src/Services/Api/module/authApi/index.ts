import api from '../../api';

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  projecttype: number;
};

export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/api/v1/login',
        method: 'POST',
        body: credentials,
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useLoginMutation } = authApi;
