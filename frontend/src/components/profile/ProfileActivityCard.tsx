export default function ProfileActivityCard({ activity }: { activity: any }) {
  const getActivityDetails = () => {
    switch (activity.type) {
      case 'KPI_CREATED':
        return { icon: '📊', text: `Created KPI: ${activity.kpiName}`, color: 'blue' };
      case 'KPI_LOG':
        return { icon: '✅', text: `Completed ${activity.completedTasks} tasks - ${activity.kpiName}`, color: 'orange' };
      case 'REQUEST_ADD_FRIEND':
        return { icon: '👋', text: 'Sent friend request to ' + activity.description, color: 'blue' };
      case 'FRIEND_REQUEST_ACCEPTED':
        return { icon: '🤝', text: `Friend request of ${activity.description} accepted`, color: 'blue' };
      case 'CREATE_GROUP':
        return { icon: '👥', text: `Created group: ${activity.groupName}`, color: 'orange' };
      case 'JOIN_GROUP':
        return { icon: '🚪', text: `Joined group: ${activity.groupName}`, color: 'blue' };
      case 'LEAVE_GROUP':
        return { icon: '🚶', text: `Left group: ${activity.groupName}`, color: 'orange' };
      default:
        return { icon: '📌', text: 'Activity', color: 'gray' };
    }
  };

  const details = getActivityDetails();

  const colorClasses = {
    blue: 'bg-primary/10 border-primary/20 text-primary',
    orange: 'bg-secondary/10 border-secondary/20 text-secondary',
    gray: 'bg-muted border-border text-muted-foreground',
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 24) return `${hours}h ago`;
    if (hours < 48) return 'Yesterday';
    return d.toLocaleDateString();
  };

  return (
    <div className={`flex items-center gap-4 rounded-xl border p-4 transition-all ${colorClasses[details.color as keyof typeof colorClasses]}`}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-current/10 shadow-inner">
        <span className="text-xl">{details.icon}</span>
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-foreground">{details.text}</p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mt-1">{formatDate(activity.createdAt)}</p>
      </div>
    </div>
  );
}