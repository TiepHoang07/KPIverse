import api from './axios';

export const getMyGroups = () =>
  api.get('/groups/my').then(res => res.data);

export const createGroup = (data: { name: string; description?: string }) =>
  api.post('/groups', data).then(res => res.data);

export const getGroup = (groupId: number) =>
  api.get(`/groups/${groupId}`);

export const getGroupKpis = (groupId: number) =>
  api.get(`/groups/${groupId}/kpis`);

export const getGroupLeaderboard = (groupId: number) =>
  api.get(`/groups/${groupId}/leaderboard`);

export const getGroupActivities = (groupId: number) =>
  api.get(`/groups/${groupId}/activities`);
