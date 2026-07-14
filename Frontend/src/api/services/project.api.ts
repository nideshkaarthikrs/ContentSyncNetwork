import { projectApi } from "../client";
import { CsnEnvelope, unwrap } from "../envelope";
import { appendRNFile, RNFile } from "../rnFile";

export interface ProjectMember {
  userId: string;
  role: string;
  inviteStatus: string;
}

export interface ProjectFile {
  fileId: string;
  filename: string;
  fileUrl: string;
  fileSize: number | null;
  mimeType: string | null;
  uploadedBy: string;
  createdAt: string;
}

export interface ProjectSummary {
  projectId: string;
  projectName: string;
  status: string;
  role: "OWNER" | "MEMBER";
  createdAt: string;
}

export const projectService = {
  create: (projectName: string) =>
    projectApi
      .post<CsnEnvelope<{ projectId: string; status: string }>>("/projects", { projectName })
      .then((res) => unwrap(res.data)),

  getMyProjects: (page = 1, limit = 10) =>
    projectApi
      .get<CsnEnvelope<{ projects: ProjectSummary[]; total: number; page: number; limit: number }>>("/projects/my", { params: { page, limit } })
      .then((res) => unwrap(res.data)),

  invite: (projectId: string, userId: string, role: string) =>
    projectApi
      .post<CsnEnvelope<{ projectId: string; userId: string; role: string; inviteStatus: string }>>(
        `/projects/${projectId}/invite`,
        { userId, role },
      )
      .then((res) => unwrap(res.data)),

  respondToInvite: (projectId: string, status: "ACCEPTED" | "DECLINED") =>
    projectApi
      .patch<CsnEnvelope<{ projectId: string; userId: string; inviteStatus: string }>>(
        `/projects/${projectId}/invite`,
        { status },
      )
      .then((res) => unwrap(res.data)),

  getMembers: (projectId: string) =>
    projectApi
      .get<CsnEnvelope<{ projectId: string; members: ProjectMember[] }>>(`/projects/${projectId}/members`)
      .then((res) => unwrap(res.data)),

  getFiles: (projectId: string) =>
    projectApi
      .get<CsnEnvelope<{ projectId: string; files: ProjectFile[] }>>(`/projects/${projectId}/files`)
      .then((res) => unwrap(res.data)),

  uploadFile: (projectId: string, file: RNFile) => {
    const form = new FormData();
    appendRNFile(form, "file", file);
    return projectApi
      .post<CsnEnvelope<{ fileId: string; filename: string; fileUrl: string; createdAt: string }>>(
        `/projects/${projectId}/files`,
        form,
      )
      .then((res) => unwrap(res.data));
  },
};
