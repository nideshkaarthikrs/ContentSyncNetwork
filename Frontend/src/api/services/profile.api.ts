import { profileApi } from "../client";
import { CsnEnvelope, unwrap } from "../envelope";
import { appendRNFile, RNFile } from "../rnFile";

export interface Profile {
  userId: string;
  name: string;
  roles: string[];
  primaryRole: string | null;
  followers: number;
  rating: number;
  publicProfile: boolean;
  pushNotificationsEnabled: boolean;
  avatarUrl: string | null;
}

export interface UpdateProfilePayload {
  name?: string;
  bio?: string;
  roles?: string[];
  primaryRole?: string;
  publicProfile?: boolean;
  pushNotificationsEnabled?: boolean;
}

// getProfile/updateProfile return the profile object directly at the response root (no envelope) — do not use unwrap().
export const profileService = {
  getProfile: (userId: string) => profileApi.get<Profile>(`/profiles/${userId}`).then((res) => res.data),

  updateProfile: (userId: string, payload: UpdateProfilePayload) =>
    profileApi.put<Profile>(`/profiles/${userId}`, payload).then((res) => res.data),

  uploadPhoto: (userId: string, file: RNFile) => {
    const form = new FormData();
    appendRNFile(form, "photo", file);
    return profileApi
      .post<{ status: "SUCCESS"; message: string; avatarUrl: string }>(`/profiles/${userId}/photo`, form)
      .then((res) => res.data);
  },

  follow: (userId: string) =>
    profileApi.post<{ status: "SUCCESS"; message: string }>(`/users/${userId}/follow`).then((res) => res.data),

  unfollow: (userId: string) =>
    profileApi.delete<{ status: "SUCCESS"; message: string }>(`/users/${userId}/follow`).then((res) => res.data),

  getFollowers: (userId: string) =>
    profileApi.get<CsnEnvelope<unknown[]>>(`/users/${userId}/followers`).then((res) => unwrap(res.data)),
};
