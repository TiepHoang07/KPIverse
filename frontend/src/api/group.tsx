import api from "./axios";

export const getMyGroups = () => api.get("/groups/my").then((res) => res.data);

export const createGroup = (data: { name: string; description?: string }) =>
  api.post("/groups", data).then((res) => res.data);

export const createGroupKpi = (
  data: {
    name: string;
    description?: string;
    type: "DAILY" | "WEEKLY" | "MONTHLY";
    scope: "PERSONAL" | "GROUP";
    tasks: { name: string }[];
  },
  groupId: number,
) => api.post(`/groups/${groupId}/create-kpi`, data).then((res) => res.data);

export const logGroupKpiTasks = (
  groupId:number,
  kpiId: number,
  data: {
    taskIds: number[];
    completed: boolean;
  }
) => api.post(`/groups/${groupId}/${kpiId}/log`, data);

export const getGroup = (groupId: number) => api.get(`/groups/${groupId}`);

export const getKpiLeaderboard = (groupId: number, kpiId: number) =>
  api.get(`/groups/${groupId}/leaderboard/${kpiId}`);

export const getGroupMembers = (groupId: number) =>
  api.get(`/groups/${groupId}/members`);

export const removeGroupMember = (groupId: number, userId: number) =>
  api.delete(`/groups/${groupId}/members/${userId}`);

export const addGroupMember = (groupId: number, userId: number) =>
  api.post(`/groups/${groupId}/members/${userId}`);

export const transferAdmin = (groupId: number, newAdminId: number) =>
  api.post(`/groups/${groupId}/transfer-admin/${newAdminId}`);

export const deleteGroupKpi = (groupId: number, kpiId: number) => 
  api.delete(`/groups/${groupId}/kpis/${kpiId}`);

export const getGroupKpiById = (groupId: number, kpiId: number) => 
  api.get(`/groups/${groupId}/kpis/${kpiId}`);

export const searchUsers = (query: string) =>
  api.get('/users/search', { params: { q: query } });
