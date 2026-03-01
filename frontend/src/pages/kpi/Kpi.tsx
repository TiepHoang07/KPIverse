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
      <div className="flex min-h-[50vh] items-center justify-center p-6">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (!kpi) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-6">
        <p className="text-red-500">KPI not found</p>
        <button
          onClick={handleBack}
          className="mt-4 cursor-pointer text-blue-600 hover:underline"
        >
          ← Back to KPIs
        </button>
      </div>
    );
  }

  const nextAvailableMessage = getNextAvailableMessage();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      {/* Header with actions */}
      <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <button
          onClick={handleBack}
          className="flex cursor-pointer items-center gap-1 text-sm text-blue-600 hover:underline sm:text-base"
        >
          ← Back to KPIs
        </button>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-full cursor-pointer rounded-lg border border-red-500 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
        >
          {deleting ? "Deleting..." : "Delete KPI"}
        </button>
      </div>

      {/* Type badge and time info */}
      <div className="mb-4 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
            kpi.type === "DAILY" ? "bg-blue-100 text-blue-800" : ""
          } ${kpi.type === "WEEKLY" ? "bg-purple-100 text-purple-800" : ""} ${
            kpi.type === "MONTHLY" ? "bg-orange-100 text-orange-800" : ""
          }`}
        >
          {kpi.type}
        </span>

        {lastLoggedDate && (
          <span className="text-xs text-gray-500 sm:text-sm">
            Last logged: {new Date(lastLoggedDate).toLocaleString()}
          </span>
        )}
      </div>

      {/* Main KPI card */}
      <div className="mb-6 rounded-2xl border-l-4 border-l-cyan-500 bg-gray-50 p-4 shadow-sm sm:p-6">
        {/* Header */}
        <div className="mb-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
          <h1 className="break-words text-xl font-semibold sm:text-2xl">
            {kpi.name}
          </h1>
          <span className="text-xs text-gray-400 sm:text-sm">
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
            <p className="flex items-center gap-2 text-xs text-yellow-800 sm:text-sm">
              <span>⏰</span>
              {nextAvailableMessage}
            </p>
          </div>
        )}

        {/* Progress section */}
        <div className="mb-6">
          <div className="mb-1 flex flex-col justify-between gap-1 text-xs text-gray-600 sm:flex-row sm:text-sm">
            <span>Overall Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200 sm:h-3">
            <div
              className="h-2 rounded-full bg-green-500 transition-all sm:h-3"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-1 text-right text-xs text-gray-500">
            {checked.length} of {kpi.tasks?.length || 0} tasks completed
          </div>
        </div>

        {/* Tasks section */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-medium sm:text-base">Tasks</h3>
          <div className="space-y-2 rounded-xl bg-white p-3 shadow-sm sm:p-4">
            {kpi.tasks?.map((task: any) => (
              <KpiTaskItem
                key={task.id}
                task={task}
                checked={checked.includes(task.id)}
                onToggle={toggleTask}
                disabled={!canLogTasks}
              />
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:mt-12 sm:flex-row">
          <button
            onClick={handleSave}
            disabled={saving || checked.length === 0 || !canLogTasks}
            className={`w-full rounded-xl px-4 py-3 text-sm font-medium transition sm:flex-1 sm:text-base ${
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
            className={`w-full rounded-xl border px-4 py-3 text-sm transition sm:w-auto ${
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
                className="cursor-pointer text-xs text-gray-500 transition hover:text-gray-700 sm:text-sm"
              >
                Clear selection
              </button>
            </div>
          )}
      </div>

      {/* Chart section */}
      <div className="my-6">
        <KpiChart kpiId={Number(kpiId)} />
      </div>

      {/* Additional info section */}
      <div className="mt-4 flex flex-col gap-2 text-xs text-gray-400 sm:flex-row sm:justify-between">
        {kpi.createdAt && (
          <span>Created: {new Date(kpi.createdAt).toLocaleDateString()}</span>
        )}
        {kpi.isActive === false && (
          <span className="text-green-600">✓ Finished</span>
        )}
      </div>
    </div>
  );
}