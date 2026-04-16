import { useAuth } from "../../auth/AuthContext";
import type { Activity } from "../../types/activity";

type Props = {
  activity: Activity;
};

export default function ActivityCard({ activity }: Props) {
  const { user } = useAuth();

  return (
    <div className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm border border-border/40 transition-all hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative h-10 w-10 shrink-0">
            <img
              src={
                activity.user.avatarUrl ||
                `https://ui-avatars.com/api/?name=${activity.user.name}&background=2E4057&color=fff&size=50`
              }
              className="h-full w-full block rounded-xl object-cover ring-2 ring-white shadow-md"
              alt={activity.user.name}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black uppercase tracking-tighter text-primary">
                {activity.user.name}
              </span>
              {activity.user.id === user?.id && (
                <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                  You
                </span>
              )}
            </div>
            <p className="mt-1 text-sm font-medium leading-relaxed text-foreground/80 text-wrap">
              {renderActivityText(activity)}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 whitespace-nowrap">
          {new Date(activity.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
        </span>
      </div>
    </div>
  );
}

function renderActivityText(activity: any) {
  switch (activity.type) {
    case "KPI_CREATED":
      return `📊 created a new KPI: ${activity.kpiName}`;
    case "KPI_LOG":
      return `✅ completed ${activity.completedTasks} task(s) for ${activity.kpiName}`;
    case "REQUEST_ADD_FRIEND":
      return `👋 sent a friend request to ${activity.description}`;
    case "FRIEND_REQUEST_ACCEPTED":
      return `🤝 accepted a friend request: ${activity.description}`;
    case "CREATE_GROUP":
      return `👥 created group: ${activity.groupName}`;
    case "JOIN_GROUP":
      return `🚪 joined group: ${activity.groupName}`;
    case "LEAVE_GROUP":
      return `🚶 left group: ${activity.groupName}`;
    default:
      return `performed an action`;
  }
}
