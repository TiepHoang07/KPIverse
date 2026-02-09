import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getGroup } from '../../api/group';
import GroupKpiList from '../../components/group/GroupKpiList';
import GroupActivityFeed from '../../components/group/GroupActivityFeed';
import GroupLeaderboard from '../../components/group/GroupLeaderboard';
import GroupHeader from '../../components/group/GroupHeader';

export default function GroupsPage() {
  const { groupId } = useParams();
  const [group, setGroup] = useState<any>(null);

  useEffect(() => {
    getGroup(Number(groupId)).then(res => setGroup(res.data));
  }, [groupId]);

  if (!group) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <GroupHeader group={group} />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <GroupKpiList groupId={group.id} />
          <GroupActivityFeed groupId={group.id} />
        </div>

        <GroupLeaderboard groupId={group.id} />
      </div>
    </div>
  );
}
