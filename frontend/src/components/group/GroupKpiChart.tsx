// components/group/GroupKpiChart.tsx
import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { getGroupKpiById } from "../../api/group";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
);

type GroupKpiChartProps = {
  groupId: number;
  kpiId: number;
};

type UserLogData = {
  userId: number;
  userName: string;
  avatarUrl?: string;
  logCount: number;
  color: string;
};

export default function GroupKpiChart({ groupId, kpiId }: GroupKpiChartProps) {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any>(null);
  const [userLogs, setUserLogs] = useState<UserLogData[]>([]);
  const [timelineData, setTimelineData] = useState<any>(null);

  useEffect(() => {
    const fetchGroupKpiData = async () => {
      try {
        const res = await getGroupKpiById(groupId, kpiId);
        const kpi = res.data;

        if (!kpi.recentLogs || kpi.recentLogs.length === 0) {
          setChartData(null);
          setLoading(false);
          return;
        }

        // Process logs by user
        const logsByUser = kpi.recentLogs.reduce((acc: any, log: any) => {
          const userId = log.user.id;
          if (!acc[userId]) {
            acc[userId] = {
              userId,
              userName: log.user.name,
              avatarUrl: log.user.avatarUrl,
              logCount: 0,
              color: `hsl(${(userId * 50) % 360}, 70%, 60%)`,
            };
          }
          acc[userId].logCount += 1;
          return acc;
        }, {});

        const userLogsArray = Object.values(logsByUser) as UserLogData[];
        setUserLogs(userLogsArray);

        // Bar chart data - logs per user
        setChartData({
          labels: userLogsArray.map((u) => u.userName.split(" ")[0]),
          datasets: [
            {
              label: "Tasks Completed",
              data: userLogsArray.map((u) => u.logCount),
              backgroundColor: userLogsArray.map((u) => u.color),
              borderColor: userLogsArray.map((u) =>
                u.color.replace("60%", "40%"),
              ),
              borderWidth: 1,
              borderRadius: 4,
            },
          ],
        });

        // Process full timeline data (from first log to now)
        const allLogs = [...kpi.recentLogs].sort(
          (a, b) =>
            new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime(),
        );

        if (allLogs.length > 0) {
          // Get first log date (normalized to midnight)
          const firstLogDate = new Date(allLogs[0].loggedAt);
          firstLogDate.setHours(0, 0, 0, 0);
          
          // Use current date as last date (normalized to midnight)
          const lastLogDate = new Date();
          lastLogDate.setHours(0, 0, 0, 0);

          // Generate all dates between first log and now
          const allDates: Date[] = [];
          const currentDate = new Date(firstLogDate);
          while (currentDate <= lastLogDate) {
            allDates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
          }

          // Format dates consistently
          const dateLabels = allDates.map((date) => 
            date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          );

          // Group logs by normalized date and user
          const logsByDateAndUser: any = {};
          kpi.recentLogs.forEach((log: any) => {
            const logDate = new Date(log.loggedAt);
            logDate.setHours(0, 0, 0, 0);
            const dateStr = logDate.toLocaleDateString();
            const userId = log.user.id;

            if (!logsByDateAndUser[dateStr]) {
              logsByDateAndUser[dateStr] = {};
            }
            logsByDateAndUser[dateStr][userId] =
              (logsByDateAndUser[dateStr][userId] || 0) + 1;
          });

          // Create timeline datasets for each user
          const timelineDatasets = userLogsArray.map((user) => ({
            label: user.userName.split(" ")[0],
            data: allDates.map((date) => {
              const dateStr = date.toLocaleDateString();
              return logsByDateAndUser[dateStr]?.[user.userId] || 0;
            }),
            borderColor: user.color,
            backgroundColor: user.color.replace("60%", "10%"),
            tension: 0.2,
            fill: false,
            pointRadius: 2,
            pointHoverRadius: 4,
          }));

          setTimelineData({
            labels: dateLabels,
            datasets: timelineDatasets,
          });
        }
      } catch (error) {
        console.error("Failed to fetch group KPI data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupKpiData();
  }, [groupId, kpiId]);

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-[2.5rem] bg-white border border-border/40 p-4 shadow-xl">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border/20 border-t-primary"></div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="rounded-[2.5rem] bg-white border border-border/40 p-12 text-center shadow-xl">
        <p className="text-muted-foreground font-black italic opacity-30">No collective achievements yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Member Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {userLogs.map((user) => (
          <div
            key={user.userId}
            className="flex items-center gap-4 rounded-3xl bg-white border border-border/40 p-4 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group"
          >
            <div
              className="h-3 w-3 rounded-full ring-4 ring-background shadow-inner transition-transform group-hover:scale-125"
              style={{ backgroundColor: user.color }}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[10px] font-black text-primary uppercase tracking-tighter">
                {user.userName}
              </p>
              <p className="text-[12px] font-black text-secondary uppercase tracking-widest">{user.logCount} LOGS</p>
            </div>
          </div>
        ))}
      </div>

      {/* Timeline Chart - Full History */}
      {timelineData && timelineData.datasets.length > 0 && (
        <div
          className="rounded-[2.5rem] bg-white border border-border/40 p-10 shadow-2xl"
          style={{ maxHeight: "45vh" }}
        >
          <div className="mb-8 flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/50">
              Collective Velocity
            </h3>
          </div>
          <div style={{ height: "30vh" }}>
            <Line
              data={timelineData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: {
                      usePointStyle: true,
                      pointStyle: 'circle',
                      padding: 25,
                      color: "rgba(46, 64, 87, 0.6)",
                      font: { size: 10, weight: "bold", family: "'Outfit', sans-serif" },
                    },
                  },
                  tooltip: {
                    backgroundColor: "#2E4057",
                    titleColor: "#FB923C",
                    bodyColor: "#FFFFFF",
                    titleFont: { weight: 'bold', size: 12 },
                    bodyFont: { weight: 'bold', size: 10 },
                    padding: 12,
                    cornerRadius: 16,
                    mode: "index",
                    intersect: false,
                    displayColors: true,
                    callbacks: {
                      label: (context) => {
                        const label = context.dataset.label || "";
                        const value = context.raw as number;
                        return `${label}: ${value} ACHIEVEMENTS`;
                      },
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                      color: "rgba(46, 64, 87, 0.4)",
                      font: { weight: "black", size: 10 },
                    },
                    grid: { color: "rgba(46, 64, 87, 0.05)" },
                  },
                  x: {
                    grid: { display: false },
                    ticks: {
                      color: "rgba(46, 64, 87, 0.4)",
                      font: { size: 9, weight: "black" },
                      maxTicksLimit: 12,
                    },
                  },
                },
                elements: {
                  line: {
                    tension: 0.4,
                    borderWidth: 3,
                  },
                  point: {
                    radius: 0,
                    hoverRadius: 5,
                    borderWidth: 2,
                    hoverBorderWidth: 2,
                  },
                },
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}