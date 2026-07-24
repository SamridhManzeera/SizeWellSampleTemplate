import api from '../../api';

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  projecttype: number;
};

export type VerifyTokenRequest = {
  projecttype: number | null;
};

export type VerifyTokenResponse = {
  valid: boolean;
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
    verifyToken: build.mutation<VerifyTokenResponse, VerifyTokenRequest>({
      query: (body) => ({
        url: '/api/v1/verify-token',
        method: 'POST',
        body,
        showLoader: false,
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useLoginMutation, useVerifyTokenMutation } = authApi;
