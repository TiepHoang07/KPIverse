import { useNavigate } from "react-router-dom";

export function GroupKpiCard({ group, kpi }: any) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/groups/${group.group.id}/${kpi.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="group bg-card rounded-2xl p-6 shadow-xl border border-border hover:border-primary/30 transition-all cursor-pointer relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors"></div>

      {/* Header */}
      <div className="flex items-start justify-between relative z-10">
        <h3 className="text-lg font-bold text-foreground leading-tight">{kpi.name}</h3>
        <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-2.5 py-1 rounded-full border border-primary/20 whitespace-nowrap">
          {kpi.tasks?.length || 0} tasks
        </span>
      </div>

      <div className="h-1 w-12 rounded-full bg-linear-to-r from-primary to-purple-500 mt-4 relative z-10" />

      {/* Description */}
      {kpi.description && (
        <p className="text-sm font-medium text-muted-foreground/60 mb-6 line-clamp-2 mt-4 relative z-10">
          {kpi.description}
        </p>
      )}

      {/* Task List */}
      <div className="space-y-3 mb-8 relative z-10">
        {kpi.tasks?.slice(0, 3).map((task: any) => (
          <div key={task.id} className="flex items-center gap-3 text-xs">
            <div className={`h-1.5 w-1.5 rounded-full ${task.completed ? 'bg-muted-foreground/20' : 'bg-primary/40'}`}></div>
            <span className={`font-medium ${task.completed ? 'line-through text-muted-foreground/30' : 'text-muted-foreground/80'}`}>
              {task.name}
            </span>
          </div>
        ))}

        {kpi.tasks?.length > 3 && (
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/20 pl-4 mt-2">
            +{kpi.tasks.length - 3} more tasks
          </div>
        )}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
        className="w-full py-3 text-xs font-bold uppercase tracking-widest text-foreground bg-secondary/50 rounded-xl hover:bg-primary hover:text-white transition-all cursor-pointer border border-border group-hover:border-primary/30 shadow-lg"
      >
        Open KPI →
      </button>
    </div>
  );
}