import { useEffect, useState } from 'react';
import api from '../../api/axios';

/* ===== TYPES ===== */

type User = {
  id: number;
  name: string;
  points: number;
};

type KPI = {
  id: number;
  name: string;
  description?: string;
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  target: number;
  isActive: boolean;
};

/* ===== COMPONENT ===== */

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [userRes, kpiRes] = await Promise.all([
          api.get('/auth/me'),
          api.get('/kpi/my'),
        ]);

        setUser(userRes.data);
        setKpis(kpiRes.data);
      } catch (error) {
        console.error('Failed to load dashboard', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      {/* ===== HEADER ===== */}
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back{user?.name ? `, ${user.name}` : ''}
        </h1>
        <p className="text-gray-600">
          Here’s a quick overview of your progress
        </p>
      </div>

      {/* ===== STATS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Points" value={user?.points ?? 0} />
        <StatCard title="Active KPIs" value={kpis.filter(k => k.isActive).length} />
        <StatCard title="All KPIs" value={kpis.length} />
      </div>

      {/* ===== KPI LIST ===== */}
      <div>
        <h2 className="text-xl font-semibold mb-4">My KPIs</h2>

        {kpis.length === 0 ? (
          <p className="text-gray-500">You have no KPIs yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kpis.map((kpi) => (
              <div
                key={kpi.id}
                className="bg-white p-4 rounded shadow space-y-1"
              >
                <h3 className="font-bold">{kpi.name}</h3>
                {kpi.description && (
                  <p className="text-sm text-gray-600">
                    {kpi.description}
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  {kpi.type} • Target: {kpi.target}
                </p>
                {!kpi.isActive && (
                  <span className="text-xs text-red-500">Inactive</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ===== SMALL COMPONENT ===== */

function StatCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
