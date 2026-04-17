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
              borderColor: '#FB923C', // Muted Coral (Secondary)
              backgroundColor: 'rgba(241, 214, 192, 0.15)',
              fill: true,
              tension: 0.4,
              pointRadius: 0,
              pointHoverRadius: 6,
              pointBackgroundColor: '#FB923C',
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
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
      <div className="flex h-48 items-center justify-center rounded-2xl sm:rounded-[2rem] bg-white border border-border/40 p-4 shadow-xl">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border/20 border-t-secondary"></div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="rounded-2xl sm:rounded-[2rem] bg-white border border-border/40 p-5 sm:p-10 text-center">
        <p className="text-muted-foreground font-bold italic opacity-30">No activity logs recorded yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl sm:rounded-[2rem] bg-white border border-border/40 p-5 sm:p-8" style={{ maxHeight: '45vh' }}>
      <h3 className="mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
        Performance Spectrum
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
                backgroundColor: "#FB923C",
                titleColor: "#FB923C",
                bodyColor: "#FFFFFF",
                titleFont: { weight: 'bold', size: 12 },
                bodyFont: { weight: 'bold', size: 10 },
                padding: 12,
                cornerRadius: 16,
                displayColors: false,
                callbacks: {
                  label: (context) => `${context.raw} ACHIEVEMENTS`,
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { 
                  stepSize: 1,
                  color: "rgba(46, 64, 87, 0.4)",
                  font: { weight: "bold", size: 10 },
                },
                grid: { color: 'rgba(46, 64, 87, 0.05)' },
              },
              x: {
                grid: { display: false },
                ticks: {
                  color: "rgba(46, 64, 87, 0.4)",
                  font: { size: 9, weight: "bold" },
                  maxTicksLimit: 7,
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
}