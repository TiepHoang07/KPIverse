export type Activity = {
  id: number;
  type: 'KPI_LOG' | 'KPI_COMPLETED' | 'LIKE' | 'JOIN_GROUP';
  createdAt: string;
  user: {
    id: number;
    name: string;
    avatarUrl?: string;
  };
  likesCount: number;
  likedByMe: boolean;
  payload?: any;
};
