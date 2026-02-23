import { useEffect, useState } from 'react';
import ActivityCard from '../activity/ActivityCard';
import { fetchGroupFeed } from '../../api/activity';

export default function GroupActivityFeed({ groupId }: { groupId: number }) {
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    fetchGroupFeed(groupId).then(res => setActivities(res.data));
  }, [groupId]);

  return (
    <div className="space-y-4">
      <h2 className="font-semibold">Group Activity</h2>
      {activities.map(a => (
        <ActivityCard key={a.id} activity={a} />
      ))}
    </div>
  );
}
