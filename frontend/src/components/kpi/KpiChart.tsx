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

  useEffect(() => {
    const fetchKpiData = async () => {
      try {
        const res = await api.get(`/kpis/${kpiId}`);
        const kpi = res.data;

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
      <div className="flex h-48 items-center justify-center rounded-2xl bg-card border border-border p-4 shadow-xl">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary"></div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="rounded-2xl bg-card border border-border p-10 text-center shadow-xl">
        <p className="text-muted-foreground font-medium italic">No activity logs recorded yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card border border-border p-6 shadow-xl" style={{ maxHeight: '40vh' }}>
      <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-muted-foreground/80">
        Progress Timeline
      </h3>
      <div style={{ height: '30vh' }}>
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: "rgba(10, 10, 20, 0.9)",
                titleColor: "#fff",
                bodyColor: "rgba(255, 255, 255, 0.8)",
                borderColor: "rgba(255, 255, 255, 0.1)",
                borderWidth: 1,
                padding: 10,
                cornerRadius: 12,
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
                  color: "rgba(255, 255, 255, 0.4)",
                  font: { weight: "bold", size: 10 },
                  callback: (value) => value,
                },
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
              },
              x: {
                grid: { display: false },
                ticks: {
                  maxRotation: 45,
                  minRotation: 45,
                  color: "rgba(255, 255, 255, 0.4)",
                  font: { size: 9, weight: "bold" },
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