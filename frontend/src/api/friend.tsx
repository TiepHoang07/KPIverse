import api from './axios';

export const searchUsers = (q: string) =>
  api.get(`/users/search?q=${q}`);

export const sendFriendRequest = (receiverId: number) => {
  return api.post('/friends/request', {receiverId});
}

export const getFriends = () =>
  api.get('/friends');

export const getFriendRequests = () =>
  api.get('/friends/pending'); 

export const getFriendRequestsSent = () =>
  api.get('/friends/sent');

export const respondFriendRequests = (friendId: number, action: 'ACCEPTED' | 'REJECTED') => {
  return api.post('/friends/respond', {
    friendId,
    action
  });
};

export const DeleteFriend = (targetId: number) => {
  return api.delete(`/friends/${targetId}`);
}