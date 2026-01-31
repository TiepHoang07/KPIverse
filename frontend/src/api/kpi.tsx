import api from './axios';

export const logKpi = (kpiId: number, value: number) => {
  return api.post(`/kpis/${kpiId}/log`, { value });
};
