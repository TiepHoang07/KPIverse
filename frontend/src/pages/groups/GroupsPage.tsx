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
      <div className="flex h-48 items-center justify-center rounded-xl bg-white p-4 shadow">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
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
