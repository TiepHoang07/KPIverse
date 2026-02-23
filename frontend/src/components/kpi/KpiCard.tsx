// components/kpi/KpiCard.tsx
import { useNavigate } from 'react-router-dom';

type Props = {
  kpi: {
    id: number;
    name: string;
    description?: string;
    tasks: {
      id: number;
      name: string;
      completed?: boolean;
    }[];
  };
};

export default function KpiCard({ kpi }: Props) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/kpis/${kpi.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-white p-4 rounded-xl shadow mb-4 cursor-pointer hover:shadow-lg transition"
    >
      {/* Header with title and task count */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-lg">{kpi.name}</h3>
        <span className="text-xs text-gray-400">
          {kpi.tasks?.length || 0} tasks
        </span>
      </div>

      {/* Description */}
      {kpi.description && (
        <p className="text-sm text-gray-500 mb-3">{kpi.description}</p>
      )}

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-sm text-gray-700 mb-1">
          <span>Tasks:</span>
        </div>
      </div>

      <div className="space-y-2">
        {kpi.tasks.map((task) => (
          <ul key={task.id} className="flex items-center gap-2 text-sm list-disc ml-5">
            <li className={task.completed ? 'line-through text-gray-400' : ''}>
              {task.name}
            </li>
          </ul>
        ))}
      </div>
    </div>
  );
}