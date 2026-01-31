import api from './axios';

export const getGroup = (groupId: number) =>
  api.get(`/groups/${groupId}`);

export const getGroupKpis = (groupId: number) =>
  api.get(`/groups/${groupId}/kpis`);

export const getGroupLeaderboard = (groupId: number) =>
  api.get(`/groups/${groupId}/leaderboard`);

export const getGroupActivities = (groupId: number) =>
  api.get(`/groups/${groupId}/activities`);
