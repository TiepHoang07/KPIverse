import api from './axios';

export const getMyKpis = () => api.get('/kpis');

export const createKpi = (data: {
  name: string;
  description?: string;
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  scope: 'PERSONAL' | 'GROUP';
  tasks: { name: string }[];
}) => api.post('/kpis', data);

export const getKpi = (kpiId: number) => api.get(`/kpis/${kpiId}`)

export const logKpiTasks = (
  kpiId: number,
  data: {
    logs: {
      kpiTaskId: number;
      completed: boolean;
    }[];
  }
) => api.post(`/kpis/${kpiId}/log`, data);

export const deleteKpi = (kpiId: number) => {
  return api.delete(`/kpis/${kpiId}`);
};

export const fetchKpiStats = (kpiId: number) => {
  return api.get(`/kpis/${kpiId}/stats`);
};
