import { Plus } from "lucide-react";
import { GroupKpiCard } from "./GroupKpiCard";
import { useNavigate } from "react-router-dom";


interface Props {
  group: any;
}

export default function GroupKpiList({ group }: Props) {
  const navigate = useNavigate();
  return (
    <div className="bg-white p-6 rounded-2xl shadow-md space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Group KPIs</h2>

        {group.membership.role === "ADMIN" && (
          <button onClick={() => navigate(`/groups/${group.group.id}/create-kpi`)} className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl hover:opacity-90 transition cursor-pointer">
            <Plus size={16} />
            Create KPI
          </button>
        )}
      </div>

      {/* Empty state */}
      {group.kpis.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          <p>No KPIs yet</p>
          {group.membership.role === "ADMIN" && (
            <p className="text-sm mt-2">
              Start by creating the first KPI for your team 🚀
            </p>
          )}
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {group.kpis.map((kpi: any) => (
          <GroupKpiCard group={group} kpi={kpi} />
        ))}
      </div>
    </div>
  );
}

