import api from './axios';

// Activity Feed endpoints
export const fetchFeed = () => {
  return api.get('/activities/feed');
};

export const fetchUserActivities = (userId: number) => {
  return api.get(`/activities/user/${userId}`);
};

export const fetchGroupFeed = (groupId: number) => {
  return api.get(`/activities/group/${groupId}`);
};

export const fetchActivitiesByType = (type: string) => {
  return api.get(`/activities/type/${type}`);
};

export const ActivityTypes = {
  KPI_LOG: 'KPI_LOG',
  KPI_CREATED: 'KPI_CREATED',
  REQUEST_ADD_FRIEND: 'REQUEST_ADD_FRIEND',
  FRIEND_REQUEST_ACCEPTED: 'FRIEND_REQUEST_ACCEPTED',
  CREATE_GROUP: 'CREATE_GROUP',
  JOIN_GROUP: 'JOIN_GROUP',
  LEAVE_GROUP: 'LEAVE_GROUP',
} as const;

export type ActivityType = typeof ActivityTypes[keyof typeof ActivityTypes];