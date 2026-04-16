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
      className="relative group bg-card rounded-2xl border border-border cursor-pointer hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
    >
      <div className='h-2 bg-linear-to-r from-primary/20 to-primary/50'></div>
      {/* Header */}
      <div className="flex items-start justify-between mb-3 px-5 py-3">
        <div>
          <h3 className="font-semibold text-foreground text-xl transition-colors group-hover:text-primary">{kpi.name}</h3>
          {kpi.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{kpi.description}</p>
          )}
        </div>
        <span className="text-xs font-semibold bg-secondary/10 text-secondary px-3 py-1 rounded-full text-nowrap border border-secondary/20">
          {totalTasks} tasks
        </span>
      </div>

      {/* Date */}
      <div className="mb-4 px-5">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>{date}</span>
        </div>
      </div>

      {/* Task Preview */}
      <div className="space-y-2 mb-16 px-5 py-2">
        {kpi.tasks.slice(0, 3).map((task) => (
          <div key={task.id} className="flex items-center gap-2 text-sm">
            <span className={task.completed ? "text-primary" : "text-muted-foreground"}>{task.completed ? '✓' : '○'}</span>
            <span className={`text-foreground/80 truncate ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
              {task.name}
            </span>
          </div>
        ))}
        
        {kpi.tasks.length > 3 && (
          <div className="text-xs text-muted-foreground font-medium pl-6">
            +{kpi.tasks.length - 3} more tasks...
          </div>
        )}
      </div>

      {/* View Details */}
      <div className="absolute bottom-4 right-5 text-sm font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
        View details <span>→</span>
      </div>
    </div>
  );
}