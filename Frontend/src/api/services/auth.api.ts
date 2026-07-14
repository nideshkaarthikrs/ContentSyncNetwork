import { identityApi } from "../client";

export type Role =
  | "COMPOSER"
  | "LYRICIST"
  | "SINGER"
  | "DIRECTOR"
  | "PRODUCER"
  | "AUDIENCE";

export interface RegisterPayload {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  roles: Role[];
}

export interface RegisterResponse {
  status: "SUCCESS";
  userId: string;
  message: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: "SUCCESS";
  token: string;
  refreshToken: string;
  user: { userId: string; name: string };
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

// Auth endpoints return fields at the response root (not wrapped in `data`) — do not use unwrap() here.
export const authApi = {
  register: (payload: RegisterPayload) =>
    identityApi.post<RegisterResponse>("/auth/register", payload).then((res) => res.data),

  login: (payload: LoginPayload) =>
    identityApi.post<LoginResponse>("/auth/login", payload).then((res) => res.data),

  logout: () =>
    identityApi.post<{ status: "SUCCESS" }>("/auth/logout").then((res) => res.data),

  changePassword: (payload: ChangePasswordPayload) =>
    identityApi
      .patch<{ status: "SUCCESS"; message: string }>("/auth/change-password", payload)
      .then((res) => res.data),
};
