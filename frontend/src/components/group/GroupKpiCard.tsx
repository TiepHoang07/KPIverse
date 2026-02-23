import { useNavigate } from "react-router-dom";

export function GroupKpiCard({ group, kpi }: any) {
  console.log('kpi:', kpi);
  const navigate = useNavigate();

  return (
    <div onClick={() => navigate(`/groups/${group.group.id}/${kpi.id}`)} className="p-5 rounded-2xl hover:shadow-lg transition bg-gray-50 cursor-pointer">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-lg">{kpi.name}</h3>
        <span className="text-xs text-gray-400">
          {kpi.tasks?.length || 0} tasks
        </span>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        {kpi.description || "No description"}
      </p>


      <div className="my-3">
        <div className="text-sm text-gray-700 mb-1">
          <span>Tasks:</span>
        </div>
      </div>

      <div className="space-y-2">
        {kpi.tasks.map((task: any) => (
          <ul key={task.id} className="flex items-center gap-2 text-sm list-disc ml-5">
            <li className={task.completed ? 'line-through text-gray-400' : ''}>
              {task.name}
            </li>
          </ul>
        ))}
      </div>

      <button onClick={() => navigate(`/groups/${group.group.id}/${kpi.id}`)} className="mt-4 w-full bg-white py-2 rounded-xl hover:bg-gray-100 transition cursor-pointer">
        Open KPI
      </button>
    </div>
  );
}
