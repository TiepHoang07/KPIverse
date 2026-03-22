import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getGroup } from "../../api/group";
import GroupKpiList from "../../components/group/GroupKpiList";
import GroupActivityFeed from "../../components/group/GroupActivityFeed";
import GroupHeader from "../../components/group/GroupHeader";

export default function GroupsPage() {
  const { groupId } = useParams();
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<any>(null);

  useEffect(() => {
    getGroup(Number(groupId)).then((res) => {
      setGroup(res.data);
      setLoading(false);
    });
  }, [groupId]);

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl bg-card p-4 shadow-xl border border-border">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary"></div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <GroupHeader group={group} />

      <div>
        <div className="space-y-10">
          <GroupKpiList group={group} />
          <GroupActivityFeed groupId={group.group.id} />
        </div>
      </div>
    </div>
  );
}
