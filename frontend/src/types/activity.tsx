export type Activity = {
  id: number;
  type: 'KPI_LOG' | 'KPI_COMPLETED' | 'JOIN_GROUP' | 'KPI_CREATED' | 'REQUEST_ADD_FRIEND' | 'FRIEND_REQUEST_ACCEPTED' | 'CREATE_GROUP' | 'LEAVE_GROUP';
  createdAt: string;
  user: {
    id: number;
    name: string;
    avatarUrl?: string;
  };
};
