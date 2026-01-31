import { useEffect, useState } from 'react';
import { getGroupKpis } from '../../api/group';
import KPIProgressCard from '../kpi/KpiProgressCard';

export default function GroupKpiList({ groupId }: { groupId: number }) {
  const [kpis, setKpis] = useState<any[]>([]);

  useEffect(() => {
    getGroupKpis(groupId).then(res => setKpis(res.data));
  }, [groupId]);

  return (
    <div className="space-y-3">
      <h2 className="font-semibold">Group KPIs</h2>
      {kpis.map(kpi => (
        <KPIProgressCard key={kpi.id} {...kpi} />
      ))}
    </div>
  );
}
