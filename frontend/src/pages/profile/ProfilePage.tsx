import { useEffect, useState } from "react";
import api from "../../api/axios";
import ProfileActivityCard from "../../components/profile/ProfileActivityCard";

type ViewType = "kpis" | "friends" | "groups" | "activities" | null;

export default function ProfilePage() {
  const [me, setMe] = useState<any>(null);
  const [activeView, setActiveView] = useState<ViewType>(null);

  useEffect(() => {
    api.get("/users/me").then((res) => setMe(res.data));
  }, []);

  if (!me) return <div>Loading...</div>;

  // Extract user data for easier access
  const userData = me.user;

  const handleStatClick = (view: ViewType) => {
    setActiveView(activeView === view ? null : view);
  };

  const renderContent = () => {
    switch (activeView) {
      case "kpis":
        return <KPIList kpis={userData.kpis || []} />;
      case "friends":
        // Combine friends from both sent and received
        const friends = [
          ...(userData.friendsRecv || []).map((f: any) => ({ ...f, type: 'received' })),
          ...(userData.friendsSent || []).map((f: any) => ({ ...f, type: 'sent' }))
        ];
        return <FriendsList friends={friends} />;
      case "groups":
        return <GroupsList groups={userData.memberships || []} />;
      case "activities":
        return <ActivitiesList activities={userData.activities || []} />;
      default:
        return (
          <div className="py-8 text-center text-gray-500">
            Click on a stat to view details
          </div>
        );
    }
  };

  // Calculate friend count
  const friendCount = (userData.friendsRecv?.length || 0) + (userData.friendsSent?.length || 0);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      {/* Profile Header */}
      <div className="flex flex-col items-center gap-2 rounded bg-white p-6 shadow">
        <img
          src={
            userData.avatarUrl ||
            "https://ui-avatars.com/api/?name=" + (userData.name || "User")
          }
          alt={userData.name}
          className="h-20 w-20 rounded-full object-cover"
        />
        <h2 className="mt-2 text-xl font-bold">{userData.name}</h2>
        <p className="text-gray-500">{userData.email}</p>
        <p className="text-sm text-gray-400">
          Member since {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : "N/A"}
        </p>
      </div>

      {/* Stats Cards - Clickable */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="KPIs"
          value={userData.kpis?.length || 0}
          isActive={activeView === "kpis"}
          onClick={() => handleStatClick("kpis")}
        />
        <StatCard
          label="Friends"
          value={friendCount}
          isActive={activeView === "friends"}
          onClick={() => handleStatClick("friends")}
        />
        <StatCard
          label="Groups"
          value={userData.memberships?.length || 0}
          isActive={activeView === "groups"}
          onClick={() => handleStatClick("groups")}
        />
        <StatCard
          label="Activities"
          value={userData.activities?.length || 0}
          isActive={activeView === "activities"}
          onClick={() => handleStatClick("activities")}
        />
      </div>

      {/* Today's Progress - Calculate from activities if needed */}
      {userData.activities && userData.activities.length > 0 && (
        <div className="rounded-lg bg-blue-50 p-4 shadow-sm">
          <h3 className="mb-2 font-semibold text-blue-800">Recent Activity</h3>
          <p className="text-blue-600">
            You have {userData.activities.length} recent activities
          </p>
        </div>
      )}

      {/* Dynamic Content Section */}
      <div className="rounded-lg bg-white p-4 shadow">
        <h3 className="mb-4 font-semibold">
          {activeView
            ? `${activeView.charAt(0).toUpperCase() + activeView.slice(1)} (${getCount(activeView, userData)})`
            : "Overview"}
        </h3>
        {renderContent()}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  label,
  value,
  isActive,
  onClick,
}: {
  label: string;
  value: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer rounded-lg p-4 text-center transition-all ${
        isActive
          ? "scale-105 bg-blue-500 text-white shadow-lg"
          : "bg-white text-gray-700 shadow hover:bg-gray-50"
      }`}
    >
      <div className="text-xl font-bold">{value}</div>
      <div className="text-sm">{label}</div>
    </button>
  );
}

// KPI List Component
function KPIList({ kpis }: { kpis: any[] }) {
  if (!kpis || kpis.length === 0) {
    return (
      <p className="py-4 text-center text-gray-500">No KPIs created yet</p>
    );
  }

  return (
    <div className="space-y-3">
      {kpis.map((kpi) => (
        <div key={kpi.id} className="rounded-lg border p-3 hover:bg-gray-50">
          <h4 className="font-medium">{kpi.name}</h4>
          {kpi.description && (
            <p className="text-sm text-gray-500">{kpi.description}</p>
          )}
          <div className="mt-2 flex gap-2 text-xs text-gray-400">
            <span>{kpi.type}</span>
            <span>•</span>
            <span>{kpi.tasks?.length || 0} tasks</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Friends List Component
function FriendsList({ friends }: { friends: any[] }) {
  if (!friends || friends.length === 0) {
    return <p className="py-4 text-center text-gray-500">No friends yet</p>;
  }

  return (
    <div className="space-y-3">
      {friends.map((friend, index) => {
        // Handle both structures - if it's a friend object with user data inside
        const friendData = friend.receiverUser || friend.requesterUser || friend;
        
        return (
          <div
            key={friendData.id || index}
            className="flex items-center gap-3 rounded-lg border p-3"
          >
            <img
              src={
                friendData.avatarUrl ||
                "https://ui-avatars.com/api/?name=" + (friendData.name || "User")
              }
              alt={friendData.name}
              className="h-10 w-10 rounded-full object-cover"
            />
            <div>
              <h4 className="font-medium">{friendData.name}</h4>
              <p className="text-sm text-gray-500">{friendData.email}</p>
              {friend.createdAt && (
                <p className="text-xs text-gray-400">
                  Friends since {new Date(friend.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Groups List Component
function GroupsList({ groups }: { groups: any[] }) {
  if (!groups || groups.length === 0) {
    return <p className="py-4 text-center text-gray-500">No groups joined</p>;
  }

  return (
    <div className="space-y-3">
      {groups.map((membership, index) => (
        <div key={membership.group?.id || index} className="rounded-lg border p-3">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium">{membership.group?.name || "Unknown Group"}</h4>
              {membership.group?.description && (
                <p className="text-sm text-gray-500">
                  {membership.group.description}
                </p>
              )}
              <div className="mt-2 flex gap-3 text-xs">
                <span className="text-gray-400">Role: {membership.role || "MEMBER"}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-400">
                  {membership.group?._count?.members || 0} members
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-400">
                  {membership.group?._count?.groupKpis || 0} KPIs
                </span>
              </div>
            </div>
            {membership.joinedAt && (
              <span className="text-xs text-gray-400">
                Joined {new Date(membership.joinedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Activities List Component
function ActivitiesList({ activities }: { activities: any[] }) {
  if (!activities || activities.length === 0) {
    return (
      <p className="py-4 text-center text-gray-500">No recent activities</p>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <ProfileActivityCard key={activity.id} activity={activity} />
      ))}
    </div>
  );
}

// Helper function to get count for the current view
function getCount(view: ViewType, userData: any): number {
  switch (view) {
    case "kpis":
      return userData.kpis?.length || 0;
    case "friends":
      return (userData.friendsRecv?.length || 0) + (userData.friendsSent?.length || 0);
    case "groups":
      return userData.memberships?.length || 0;
    case "activities":
      return userData.activities?.length || 0;
    default:
      return 0;
  }
}