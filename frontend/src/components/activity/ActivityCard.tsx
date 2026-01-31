import type { Activity } from "../../types/activity";
import { likeActivity } from "../../api/activity";
import { useState } from "react";

type Props = {
  activity: Activity;
};

export default function ActivityCard({ activity }: Props) {
  const [liked, setLiked] = useState(activity.likedByMe);
  const [likes, setLikes] = useState(activity.likesCount);

  const like = async () => {
    await likeActivity(activity.id);
    setLiked(true);
    setLikes(likes + 1);
  };

  return (
    <div className="space-y-2 rounded bg-white p-4 shadow">
      <div className="flex items-center gap-2">
        <img
          src={activity.user.avatarUrl || "/avatar.png"}
          className="h-8 w-8 rounded-full"
        />
        <span className="font-semibold">{activity.user.name}</span>
      </div>

      <p className="text-sm text-gray-700">{renderActivityText(activity)}</p>

      <div className="flex items-center gap-2 text-sm">
        <button disabled={liked} onClick={like} className="text-indigo-600">
          {liked ? "Liked" : "Like"}
        </button>
        <span>{likes} likes</span>
      </div>
    </div>
  );
}

function renderActivityText(activity: Activity) {
  switch (activity.type) {
    case "KPI_LOG":
      return `logged progress on ${activity.payload?.kpiName}`;
    case "KPI_COMPLETED":
      return `completed KPI ${activity.payload?.kpiName}`;
    case "JOIN_GROUP":
      return `joined group ${activity.payload?.groupName}`;
    default:
      return "did something";
  }
}
