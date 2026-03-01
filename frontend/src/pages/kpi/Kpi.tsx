// pages/kpi/kpi.tsx
import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import KpiTaskItem from "../../components/kpi/KpiTaskItem";
import KpiChart from "../../components/kpi/KpiChart"; // ✅ Added chart import
import api from "../../api/axios";

export default function Kpi() {
  const { kpiId } = useParams<{ kpiId: string }>();
  const navigate = useNavigate();

  const [kpi, setKpi] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [checked, setChecked] = useState<number[]>([]);
  const [lastLoggedDate, setLastLoggedDate] = useState<Date | null>(null);

  // Check if user can log tasks based on KPI type
  const canLogTasks = useMemo(() => {
    if (!kpi || !lastLoggedDate) return true;

    const now = new Date();
    const lastLog = new Date(lastLoggedDate);

    switch (kpi.type) {
      case "DAILY":
        // Can log if last log was on a different day
        return lastLog.toDateString() !== now.toDateString();

      case "WEEKLY":
        // Can log if last log was in a different week
        const lastWeek = getWeekNumber(lastLog);
        const currentWeek = getWeekNumber(now);
        return (
          lastWeek.year !== currentWeek.year ||
          lastWeek.week !== currentWeek.week
        );

      case "MONTHLY":
        // Can log if last log was in a different month
        return (
          lastLog.getMonth() !== now.getMonth() ||
          lastLog.getFullYear() !== now.getFullYear()
        );

      default:
        return true;
    }
  }, [kpi, lastLoggedDate, checked]);

  // Helper function to get week number
  const getWeekNumber = (date: Date) => {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(
      ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
    );
    return { year: d.getUTCFullYear(), week: weekNo };
  };

  // Get next available time message
  const getNextAvailableMessage = () => {
    if (!kpi || !lastLoggedDate || canLogTasks) return null;
    if (canLogTasks) return null;

    const lastLog = new Date(lastLoggedDate);

    switch (kpi.type) {
      case "DAILY":
        const tomorrow = new Date(lastLog);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return `Next log available tomorrow (${tomorrow.toLocaleDateString()})`;

      case "WEEKLY":
        const nextWeek = new Date(lastLog);
        nextWeek.setDate(nextWeek.getDate() + 7);
        return `Next log available week of ${nextWeek.toLocaleDateString()}`;

      case "MONTHLY":
        const nextMonth = new Date(lastLog);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return `Next log available in ${nextMonth.toLocaleDateString("en-US", { month: "long" })}`;

      default:
        return null;
    }
  };

  // Fetch KPI details
  useEffect(() => {
    if (!kpiId) return;

    const fetchKpiDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/kpis/${kpiId}`);
        setKpi(res.data);

        // Check if there are any logs today/this week/this month
        if (res.data.recentLogs && res.data.recentLogs.length > 0) {
          const latestLog = new Date(res.data.recentLogs[0].loggedAt);
          setLastLoggedDate(latestLog);
        }

        // Initialize checked state with completed tasks
        const completedTaskIds =
          res.data.tasks
            ?.filter((task: any) => task.completed)
            .map((task: any) => task.id) || [];
        setChecked(completedTaskIds);
      } catch (error) {
        console.error("Error fetching KPI details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchKpiDetails();
  }, [kpiId]);

  // Calculate progress
  const progress = useMemo(() => {
    if (!kpi?.tasks || kpi.tasks.length === 0) return 0;
    return Math.round((checked.length / kpi.tasks.length) * 100);
  }, [kpi, checked]);

  const toggleTask = (taskId: number) => {
    if (!canLogTasks) return; // Prevent toggling if can't log
    setChecked((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  };

  const handleSave = async () => {
    if (!kpi || checked.length === 0 || !canLogTasks) return;

    try {
      setSaving(true);

      await api.post(`/kpis/${kpi.id}/log`, {
        taskIds: checked,
        completed: true,
      });

      // Update last logged date
      setLastLoggedDate(new Date());

      // Show success message
      alert("Tasks logged successfully!");

      // Refresh KPI data
      const refreshedKpi = await api.get(`/kpis/${kpiId}`);
      setKpi(refreshedKpi.data);

      // Reset checked state if needed (optional)
      // setChecked([]);
    } catch (error) {
      console.error("Error saving tasks:", error);
      alert("Error saving tasks. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!kpi) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${kpi.name}"? This action cannot be undone.`,
    );
    if (!confirmDelete) return;

    try {
      setDeleting(true);
      await api.delete(`/kpis/${kpi.id}`);
      alert("KPI deleted successfully!");
      navigate("/kpis");
    } catch (error) {
      console.error("Error deleting KPI:", error);
      alert("Error deleting KPI. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handleBack = () => {
    navigate("/kpis");
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!kpi) {
    return (
      <div className="p-6">
        <div className="text-red-500">KPI not found</div>
        <button
          onClick={handleBack}
          className="mt-4 text-blue-600 hover:underline"
        >
          ← Back to KPIs
        </button>
      </div>
    );
  }

  const nextAvailableMessage = getNextAvailableMessage();

  return (
    <div className="mx-auto max-w-4xl p-6">
      {/* Header with actions */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex cursor-pointer items-center gap-1 text-blue-600 hover:underline"
        >
          ← Back to KPIs
        </button>

        <div className="flex">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="cursor-pointer rounded-lg border border-red-500 px-3 py-1 text-sm text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      {/* Type badge and time info */}
      <div className="mb-4 flex items-center gap-3">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${kpi.type === "DAILY" ? "bg-blue-100 text-blue-800" : ""} ${kpi.type === "WEEKLY" ? "bg-purple-100 text-purple-800" : ""} ${kpi.type === "MONTHLY" ? "bg-orange-100 text-orange-800" : ""} `}
        >
          {kpi.type}
        </span>

        {lastLoggedDate && (
          <span className="text-sm text-gray-500">
            Last logged: {new Date(lastLoggedDate).toLocaleString()}
          </span>
        )}
      </div>

      {/* Main KPI card */}
      <div className="rounded-2xl border-l-4 border-l-cyan-500 bg-gray-50 p-6 shadow-sm">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{kpi.name}</h1>
          <span className="text-sm text-gray-400">
            {kpi.tasks?.length || 0} tasks
          </span>
        </div>

        {/* Description */}
        {kpi.description && (
          <p className="mb-4 text-sm text-gray-500">{kpi.description}</p>
        )}

        {/* Next available message if can't log */}
        {nextAvailableMessage && (
          <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
            <p className="flex items-center gap-2 text-sm text-yellow-800">
              <span>⏰</span>
              {nextAvailableMessage}
            </p>
          </div>
        )}

        {/* Progress section */}
        <div className="mb-6">
          <div className="mb-1 flex justify-between text-sm text-gray-600">
            <span>Overall Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="h-3 rounded-full bg-gray-200">
            <div
              className="h-3 rounded-full bg-green-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-1 text-right text-xs text-gray-500">
            {checked.length} of {kpi.tasks?.length || 0} tasks completed
          </div>
        </div>

        {/* Tasks section */}
        <div className="mb-6">
          <h3 className="mb-3 font-medium">Tasks</h3>
          <div className="space-y-2 rounded-xl bg-white p-4 shadow-sm">
            {kpi.tasks?.map((task: any) => (
              <KpiTaskItem
                key={task.id}
                task={task}
                checked={checked.includes(task.id)}
                onToggle={toggleTask}
                disabled={!canLogTasks} // Disable if can't log
              />
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-12 flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving || checked.length === 0 || !canLogTasks}
            className={`flex-1 rounded-xl px-4 py-3 font-medium transition ${
              canLogTasks && checked.length > 0
                ? "cursor-pointer bg-gray-800 text-white hover:opacity-90"
                : "cursor-not-allowed bg-gray-300 text-gray-500"
            }`}
          >
            {saving
              ? "Saving..."
              : !canLogTasks && lastLoggedDate
                ? "Already logged for this period"
                : checked.length === 0
                  ? "No tasks selected"
                  : `Mark ${checked.length} task${checked.length > 1 ? "s" : ""} as completed`}
          </button>

          <button
            onClick={() => setChecked(kpi.tasks?.map((t: any) => t.id) || [])}
            disabled={!canLogTasks}
            className={`rounded-xl border px-4 py-3 transition ${
              canLogTasks
                ? "cursor-pointer text-gray-600 hover:bg-gray-50"
                : "cursor-not-allowed bg-gray-100 text-gray-400"
            }`}
          >
            Select all
          </button>
        </div>

        {/* Quick actions */}
        {checked.length > 0 &&
          checked.length < kpi.tasks?.length &&
          canLogTasks && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => setChecked([])}
                className="cursor-pointer text-sm text-gray-500 transition hover:text-gray-700"
              >
                Clear selection
              </button>
            </div>
          )}
      </div>

      {/* Additional info section */}
      <div className="mt-4 flex justify-between text-xs text-gray-400">
        {kpi.createdAt && (
          <span>Created: {new Date(kpi.createdAt).toLocaleDateString()}</span>
        )}
        {kpi.isActive === false && (
          <span className="text-green-600">✓ Finished</span>
        )}
      </div>

      {/* Chart section*/}
      <div className="my-4">
        <KpiChart kpiId={Number(kpiId)} />
      </div>
    </div>
  );
}
