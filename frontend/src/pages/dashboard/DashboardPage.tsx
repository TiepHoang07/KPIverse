import { useEffect, useState } from "react";
import api from "../../api/axios";
import KpiCard from "../../components/kpi/KpiCard";
import ActivityFeed from "../../components/activity/ActivityFeed";

type KPI = {
  id: number;
  name: string;
  description?: string;
  tasks: {
    id: number;
    name: string;
  }[];
};

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/kpis") // route mới
      .then((res) => setKpis(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500">
          Track your KPI tasks today
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      {/* Activity */}
      <div>
        <h2 className="mb-3 font-semibold">Activity</h2>
        <ActivityFeed />
      </div>
    </div>
  );
}
