import { Plus } from "lucide-react";
import { GroupKpiCard } from "./GroupKpiCard";
import { useNavigate } from "react-router-dom";


interface Props {
  group: any;
}

export default function GroupKpiList({ group }: Props) {
  const navigate = useNavigate();
  return (
    <div className="bg-card p-8 rounded-3xl shadow-2xl border border-border space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">Group Objectives</h2>
 
        {group.membership.role === "ADMIN" && (
          <button 
            onClick={() => navigate(`/groups/${group.group.id}/create-kpi`)} 
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-primary/20 cursor-pointer hover:-translate-y-0.5"
          >
            <Plus size={16} />
            New Group KPI
          </button>
        )}
      </div>
 
      {/* Empty state */}
      {group.kpis.length === 0 && (
        <div className="text-center py-16 bg-secondary/10 rounded-2xl border border-dashed border-border">
          <p className="text-muted-foreground font-medium italic">No objectives defined yet</p>
          {group.membership.role === "ADMIN" && (
            <p className="text-xs mt-3 text-primary/60 font-bold uppercase tracking-widest">
              Start by creating the first KPI for your team 🚀
            </p>
          )}
        </div>
      )}
 
      {/* KPI Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {group.kpis.map(( kpi: any) => (
          <GroupKpiCard key={kpi.id} group={group} kpi={kpi} />
        ))}
      </div>
    </div>
  );
}

