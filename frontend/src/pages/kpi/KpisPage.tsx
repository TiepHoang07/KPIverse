// pages/kpi/KpiPersonalPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import KpiCard from '../../components/kpi/KpiCard';
import api from '../../api/axios';

export default function KpiPage() {
  const [kpis, setKpis] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchKpis();
  }, []);

  const fetchKpis = async () => {
    try {
      const res = await api.get('/kpis');
      setKpis(res.data);
    } catch (error) {
      console.error('Error fetching KPIs:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">My KPIs</h1>
        <button
          onClick={() => navigate('/kpis/create')}
          className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
        >
          + Create KPI
        </button>
      </div>
      
      {kpis.length === 0 ? (
        <p className="text-gray-500">No KPIs found. Create your first KPI!</p>
      ) : (
        kpis.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))
      )}
    </div>
  );
}