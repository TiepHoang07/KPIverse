import { useAuth } from "../../auth/AuthContext";
import type { Activity } from "../../types/activity";

type Props = {
  activity: Activity;
};

export default function ActivityCard({ activity }: Props) {
  const { user } = useAuth();

  return (
    <div className={`space-y-2 p-4 rounded-xl bg-card border border-border shadow-md transition-all hover:bg-secondary/50`}>
      <div className="flex items-center gap-2">
        <img
          src={
            activity.user.avatarUrl ||
            `https://ui-avatars.com/api/?name=${activity.user.name}&background=6babff&color=fff`
          }
          className="h-8 w-8 rounded-full"
        />
        <span className="font-semibold text-foreground">{activity.user.name}{activity.user.id === user?.id ? <span className="text-primary font-bold ml-1 text-blue-500">- You</span> : null}</span>
      </div>

      <p className="my-3 text-sm text-foreground/90 font-medium">
        {renderActivityText(activity)}
      </p>
      <p className="mt-4 text-[12px] text-muted-foreground">
        {new Date(activity.createdAt).toLocaleString()}
      </p>
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
