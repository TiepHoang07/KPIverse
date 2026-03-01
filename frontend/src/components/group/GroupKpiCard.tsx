import { useNavigate } from "react-router-dom";

export function GroupKpiCard({ group, kpi }: any) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/groups/${group.group.id}/${kpi.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-white rounded-xl p-5 shadow-md border-b-5 hover:scale-101 border-b-indigo-500 hover:shadow-xl transition-all cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-gray-900">{kpi.name}</h3>
        <span className="text-xs bg-linear-to-tr from-pink-500 to-indigo-500 text-white px-2 py-1 rounded-full">
          {kpi.tasks?.length || 0} tasks
        </span>
      </div>

      <div className="h-1 w-25 rounded-4xl bg-linear-to-r from-blue-500 to-purple-500" />

      {/* Description */}
      {kpi.description && (
        <p className="text-sm text-gray-500 mb-4 line-clamp-2 mt-2">
          {kpi.description}
        </p>
      )}

      {/* Task List */}
      <div className="space-y-2 mb-4">
        {kpi.tasks?.slice(0, 3).map((task: any) => (
          <div key={task.id} className="flex items-center gap-2 text-sm">
            <span className="text-gray-400 text-xs">•</span>
            <span className={`${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
              {task.name}
            </span>
          </div>
        ))}
        
        {kpi.tasks?.length > 3 && (
          <div className="text-xs text-gray-400 pl-4">
            +{kpi.tasks.length - 3} more tasks
          </div>
        )}
      </div>

      <button 
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
        className="w-full py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition cursor-pointer"
      >
        View KPI →
      </button>
    </div>
  );
}