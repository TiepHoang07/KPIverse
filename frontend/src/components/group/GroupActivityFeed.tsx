import { useEffect, useState } from 'react';
import ActivityCard from '../activity/ActivityCard';
import { fetchGroupFeed } from '../../api/activity';

export default function GroupActivityFeed({ groupId }: { groupId: number }) {
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    fetchGroupFeed(groupId).then(res => setActivities(res.data));
  }, [groupId]);

  return (
    <div className="space-y-6">
      <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/40 ml-2">Team Activity Feed</h2>
      <div className="space-y-4">
        {activities.map(a => (
          <ActivityCard key={a.id} activity={a} />
        ))}
      </div>
    </div>
  );
}
