import api from './axios';

export const fetchFeed = () => {
  return api.get('/activities/feed');
};

export const likeActivity = (activityId: number) => {
  return api.post(`/activities/${activityId}/like`);
};
