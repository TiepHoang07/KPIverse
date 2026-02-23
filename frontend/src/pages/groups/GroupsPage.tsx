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

  console.log(group);
  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-24 animate-pulse rounded-2xl bg-gray-200" />
        <div className="h-24 animate-pulse rounded-2xl bg-gray-200" />
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
