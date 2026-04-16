import { useEffect, useState } from "react";
import api from "../../api/axios";
import ProfileActivityCard from "../../components/profile/ProfileActivityCard";

type ViewType = "kpis" | "friends" | "groups" | "activities" | null;

export default function ProfilePage() {
  const [me, setMe] = useState<any>(null);
  const [activeView, setActiveView] = useState<ViewType>("kpis");

  useEffect(() => {
    api.get("/users/me").then((res) => setMe(res.data));
  }, []);

  if (!me)
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl bg-card p-4 shadow-lg border border-border">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary"></div>
      </div>
    );

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
          ...(userData.friendsRecv || []).map((f: any) => ({
            ...f,
            type: "received",
          })),
          ...(userData.friendsSent || []).map((f: any) => ({
            ...f,
            type: "sent",
          })),
        ];
        return <FriendsList friends={friends} />;
      case "groups":
        return <GroupsList groups={userData.memberships || []} />;
      case "activities":
        return <ActivitiesList activities={userData.activities || []} />;
      default:
        return <KPIList kpis={userData.kpis || []} />;
    }
  };

  // Calculate friend count
  const friendCount =
    (userData.friendsRecv?.length || 0) + (userData.friendsSent?.length || 0);

  return (
    <div className="mx-auto max-w-xl space-y-6 pb-10">
      {/* Profile Header */}
      <div className="flex flex-col items-center gap-2 rounded-2xl bg-card p-8 shadow-xl border border-border">
        <div className="relative">
          <img
            src={
              userData.avatarUrl ||
              `https://ui-avatars.com/api/?name=${userData.name || "User"}&background=2E4057&color=fff`
            }
            alt={userData.name}
            className="h-24 w-24 shrink-0 rounded-full object-cover ring-4 ring-primary/20"
          />
          <div className="absolute bottom-0 right-0 h-6 w-6 rounded-full border-4 border-card bg-secondary"></div>
        </div>
        <h2 className="mt-4 text-2xl font-bold text-foreground">{userData.name}</h2>
        <p className="text-muted-foreground">{userData.email}</p>
        <p className="text-sm text-muted-foreground/70">
          Member since{" "}
          {userData.createdAt
            ? new Date(userData.createdAt).toLocaleDateString()
            : "N/A"}
        </p>
      </div>

      {/* Stats Cards - Clickable */}
      <div className="mx-4 grid grid-cols-2 gap-3 md:grid-cols-4">
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
        <div className="rounded-xl bg-primary/10 p-5 shadow-sm border border-primary/20">
          <h3 className="mb-2 font-semibold text-primary">Recent Activity</h3>
          <p className="text-primary/80">
            You have {userData.activities.length} recent activities
          </p>
        </div>
      )}

      {/* Dynamic Content Section */}
      <div className="rounded-2xl bg-card p-6 shadow-xl border border-border">
        <h3 className="mb-6 font-bold text-xl text-foreground">
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
      className={`relative cursor-pointer rounded-2xl p-5 text-center transition-all duration-300 border ${
        isActive
          ? "bg-primary text-white shadow-lg shadow-primary/30 border-primary -translate-y-1 scale-105"
          : "bg-card text-muted-foreground shadow-md border-border hover:bg-primary/10 hover:border-primary/20"
      }`}
    >
      <div className={`text-2xl font-bold ${isActive ? "text-white" : "text-foreground"}`}>
        {value}
      </div>
      <div className="text-xs font-medium uppercase tracking-wider mt-1">{label}</div>
    </button>
  );
}

// KPI List Component
function KPIList({ kpis }: { kpis: any[] }) {
  if (!kpis || kpis.length === 0) {
    return (
      <div className="py-12 text-center bg-primary/10 rounded-2xl border border-dashed border-border">
        <p className="text-muted-foreground font-medium italic">No personal objectives yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {kpis.map((kpi) => (
        <div
          key={kpi.id}
          className="rounded-xl border border-border bg-primary/10 p-4 transition hover:bg-primary/20 hover:border-primary/30 group"
        >
          <div className="flex justify-between items-start mb-1 gap-2">
            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{kpi.name}</h4>
            <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">
              {kpi.type}
            </span>
          </div>
          {kpi.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{kpi.description}</p>
          )}
          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground/70">
            <div className="flex items-center gap-1">
               <div className="h-1.5 w-1.5 rounded-full bg-primary/40"></div>
               <span>{kpi.tasks?.length || 0} tasks</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Friends List Component
function FriendsList({ friends }: { friends: any[] }) {
  if (!friends || friends.length === 0) {
    return (
      <div className="py-12 text-center bg-primary/10 rounded-2xl border border-dashed border-border">
        <p className="text-muted-foreground font-medium italic">No active connections yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {friends.map((friend, index) => {
        // Handle both structures - if it's a friend object with user data inside
        const friendData =
          friend.receiverUser || friend.requesterUser || friend;

        return (
          <div
            key={friendData.id || index}
            className="flex items-center gap-4 rounded-xl border border-border bg-primary/10 px-4 py-2 transition hover:bg-primary/20"
          >
            <img
              src={
                friendData.avatarUrl ||
                `https://ui-avatars.com/api/?name=
                  ${friendData.name || "User"}&background=1D4ED8&color=fff`
              }
              alt={friendData.name}
              className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-primary/20"
            />
            <div className="flex flex-col">
              <h4 className="font-semibold text-foreground">{friendData.name}</h4>
              <p className="text-sm text-muted-foreground line-clamp-1">{friendData.bio || "No bio yet"}</p>
              <p className="text-xs text-muted-foreground/60">{friendData.email}</p>
              {friend.createdAt && (
                <p className="text-[10px] uppercase font-bold tracking-wider text-primary/60 mt-2">
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
    return (
      <div className="py-12 text-center bg-primary/10 rounded-2xl border border-dashed border-border">
        <p className="text-muted-foreground font-medium italic">No group memberships yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {groups.map((membership, index) => (
        <div
          key={membership.group?.id || index}
          className="rounded-xl border border-border bg-primary/10 p-4 transition hover:bg-primary/20 group relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
          <div className="flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-4">
            <div>
              <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {membership.group?.name || "Unknown Group"}
              </h4>
              {membership.group?.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                  {membership.group.description}
                </p>
              )}
              <div className="mt-3 flex gap-3 text-[10px] font-bold uppercase tracking-wider">
                <span className="text-primary">
                  {membership.role || "MEMBER"}
                </span>
                <span className="text-muted-foreground/40">•</span>
                <span className="text-muted-foreground/60">
                  {membership.group?._count?.members || 0} members
                </span>
                <span className="text-muted-foreground/40">•</span>
                <span className="text-muted-foreground/60">
                  {membership.group?._count?.groupKpis || 0} KPIs
                </span>
              </div>
            </div>
            {membership.joinedAt && (
              <span className="text-[10px] text-muted-foreground/50 whitespace-nowrap">
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
      return (
        (userData.friendsRecv?.length || 0) +
        (userData.friendsSent?.length || 0)
      );
    case "groups":
      return userData.memberships?.length || 0;
    case "activities":
      return userData.activities?.length || 0;
    default:
      return 0;
  }
}
