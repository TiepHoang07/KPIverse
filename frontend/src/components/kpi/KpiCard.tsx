// components/kpi/KpiCard.tsx (without external icons)
import { useNavigate } from 'react-router-dom';

type Props = {
  kpi: {
    id: number;
    name: string;
    description?: string;
    createdAt: Date;
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
  const totalTasks = kpi.tasks.length;
  const date = new Date(kpi.createdAt).toLocaleString();
  

  return (
    <div 
      onClick={handleClick}
      className="relative group bg-white rounded-xl border border-gray-200 cursor-pointer hover:border-blue-300 hover:shadow-md hover:scale-101 transition-all duration-200 overflow-hidden mb-5"
    >
      <div className='h-1.5 bg-linear-to-l from-cyan-500 to-blue-500'></div>
      {/* Header */}
      <div className="flex items-start justify-between mb-3 px-5 py-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-xl">{kpi.name}</h3>
          {kpi.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{kpi.description}</p>
          )}
        </div>
        <span className="text-xs bg-linear-to-tr from-sky-500 to-emerald-500 text-white px-2 py-1 rounded-full text-nowrap">
          {totalTasks} tasks
        </span>
      </div>

      {/* Date */}
      <div className="mb-4 px-5">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{date}</span>
        </div>
      </div>

      {/* Task Preview */}
      <div className="space-y-2 mb-3 px-5 py-2">
        {kpi.tasks.slice(0, 3).map((task) => (
          <div key={task.id} className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">{task.completed ? '✓' : '○'}</span>
            <span className={`text-gray-700 truncate ${task.completed ? 'line-through text-gray-400' : ''}`}>
              {task.name}
            </span>
          </div>
        ))}
        
        {kpi.tasks.length > 3 && (
          <div className="text-xs text-gray-400 pl-5">
            +{kpi.tasks.length - 3} more
          </div>
        )}
      </div>

      {/* View Details */}
      <div className="absolute bottom-4 right-4 text-sm text-blue-600">
        View details →
      </div>
    </div>
  );
}