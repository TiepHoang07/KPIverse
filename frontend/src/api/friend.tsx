import api from './axios';

export const searchUsers = (q: string) =>
  api.get(`/users/search?q=${q}`);

export const sendFriendRequest = (userId: number) =>
  api.post(`/friends/request/${userId}`);

export const getFriends = () =>
  api.get('/friends');
