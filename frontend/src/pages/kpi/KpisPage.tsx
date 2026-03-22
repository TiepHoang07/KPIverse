// pages/kpi/KpiPersonalPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import KpiCard from '../../components/kpi/KpiCard';
import api from '../../api/axios';
import { Plus } from 'lucide-react';

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
    <div className="p-6 bg-background min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">My KPIs</h1>
        <button
          onClick={() => navigate('/kpis/create')}
          className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-3 rounded-2xl transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5 cursor-pointer"
        >
          <Plus size={20}></Plus>
          <span className="font-medium">Create KPI</span>
        </button>
      </div>
      
      {kpis.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border-2 border-dashed border-border">
          <p className="text-muted-foreground">No KPIs found. Create your first KPI to start tracking your progress!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kpis.map((kpi) => (
            <KpiCard key={kpi.id} kpi={kpi} />
          ))}
        </div>
      )}
    </div>
  );
}