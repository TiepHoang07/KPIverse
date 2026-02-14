// components/kpi/KpiCard.tsx
import { useState } from 'react';
import KpiTaskItem from './KpiTaskItem';
import { logKpiTasks } from '../../api/kpi';

type Props = {
  kpi: {
    id: number;
    name: string;
    description?: string;
    tasks: {
      id: number;
      name: string;
    }[];
  };
};

export default function KpiCard({ kpi }: Props) {
  const [checked, setChecked] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleTask = (taskId: number) => {
    setChecked((prev) =>
      prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId],
    );
  };

  const handleDone = async () => {
    if (checked.length === 0) return;

    setLoading(true);
    try {
      await logKpiTasks(kpi.id, {
        logs: checked.map((taskId) => ({
          kpiTaskId: taskId,
          completed: true,
        })),
      });
      setChecked([]); // reset UI
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow mb-4">
      <h3 className="font-semibold text-lg">{kpi.name}</h3>
      {kpi.description && (
        <p className="text-sm text-gray-500 mb-2">{kpi.description}</p>
      )}

      <div className="mb-3">
        {kpi.tasks.map((task) => (
          <KpiTaskItem
            key={task.id}
            task={task}
            checked={checked.includes(task.id)}
            onToggle={toggleTask}
          />
        ))}
      </div>

      <button
        disabled={loading}
        onClick={handleDone}
        className="bg-blue-600 text-white px-4 py-1 rounded disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Done'}
      </button>
    </div>
  );
}
