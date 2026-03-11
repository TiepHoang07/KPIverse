// components/kpi/KpiLineChart.tsx
import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import api from '../../api/axios';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

type KPIChartProps = {
  kpiId: number;
};

export default function KpiChart({ kpiId }: KPIChartProps) {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any>(null);
  const [kpiName, setKpiName] = useState('');

  useEffect(() => {
    const fetchKpiData = async () => {
      try {
        const res = await api.get(`/kpis/${kpiId}`);
        const kpi = res.data;
        setKpiName(kpi.name);

        if (!kpi.recentLogs || kpi.recentLogs.length === 0) {
          setChartData(null);
          setLoading(false);
          return;
        }

        // Sort logs by date
        const sortedLogs = [...kpi.recentLogs].sort(
          (a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime()
        );

        // Get first and last log dates (normalized to midnight)
        const firstLog = new Date(sortedLogs[0].loggedAt);
        firstLog.setHours(0, 0, 0, 0);
        
        // Use current date as last date (include today even if no logs)
        const lastLog = new Date();
        lastLog.setHours(0, 0, 0, 0);

        // Generate all dates between first and last log
        const dates: Date[] = [];
        const currentDate = new Date(firstLog);
        while (currentDate <= lastLog) {
          dates.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
        }

        // Count logs per date (normalize dates)
        const logsByDate = sortedLogs.reduce((acc: any, log: any) => {
          const logDate = new Date(log.loggedAt);
          logDate.setHours(0, 0, 0, 0);
          const dateStr = logDate.toLocaleDateString();
          acc[dateStr] = (acc[dateStr] || 0) + 1;
          return acc;
        }, {});

        // Map dates to data points
        const labels = dates.map(date => {
          return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          });
        });
        
        const data = dates.map(date => {
          const dateStr = date.toLocaleDateString();
          return logsByDate[dateStr] || 0;
        });

        setChartData({
          labels,
          datasets: [
            {
              label: 'Tasks Completed',
              data,
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              fill: true,
              tension: 0.2,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ],
        });
      } catch (error) {
        console.error('Failed to fetch KPI data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchKpiData();
  }, [kpiId]);

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl bg-white p-4 shadow">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow">
        <p className="text-gray-500">No logs yet for this KPI</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow" style={{ maxHeight: '30vh' }}>
      <h3 className="mb-2 text-sm font-medium text-gray-600">
        {kpiName} - Progress Timeline
      </h3>
      <div style={{ height: '25vh' }}>
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (context) => `${context.raw} task${context.raw === 1 ? '' : 's'} completed`,
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { 
                  stepSize: 1,
                  callback: (value) => value,
                },
                grid: { color: 'rgba(0, 0, 0, 0.05)' },
              },
              x: {
                grid: { display: false },
                ticks: {
                  maxRotation: 45,
                  minRotation: 45,
                  font: { size: 10 },
                  maxTicksLimit: 10,
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
}