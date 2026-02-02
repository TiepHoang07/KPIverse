import { useEffect, useState } from 'react';
import api from '../../api/axios';
import KPIProgressCard from '../../components/kpi/KpiProgressCard';
import KPIChart from '../../components/kpi/KpiChart';
import ActivityFeed from '../../components/activity/ActivityFeed';

type KPI = {
  id: number;
  name: string;
  target: number;
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  logs: { value: number }[];
};

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/kpis/personal')
      .then((res) => setKpis(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const labels = kpis.map((k) => k.name);
  const values = kpis.map((k) =>
    k.logs.reduce((sum, l) => sum + l.value, 0)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500">
          Track your daily, weekly and monthly KPIs
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpis.map((kpi) => {
          const current = kpi.logs.reduce(
            (sum, l) => sum + l.value,
            0
          );

          return (
            <KPIProgressCard
              key={kpi.id}
              name={kpi.name}
              target={kpi.target}
              current={current}
              type={kpi.type}
            />
          );
        })}
      </div>

      {/* Chart */}
      {kpis.length > 0 && (
        <KPIChart labels={labels} values={values} />
      )}
      <div>
        <h2 className="font-semibold mb-3">Activity</h2>
        <ActivityFeed />
      </div>
    </div>
  );
}
