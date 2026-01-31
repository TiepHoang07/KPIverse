import { useState } from 'react';
import LogKpiModal from './LogKpiModal';

type Props = {
  name: string;
  current: number;
  target: number;
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY';
};

export default function KPIProgressCard({
  name,
  current,
  target,
  type,
}: Props) {
  const [open, setOpen] = useState(false);

  const percent = Math.min((current / target) * 100, 100);

  return (
    <div className="bg-white p-4 rounded shadow space-y-2">
      <h3 className="font-semibold">{name}</h3>
      <p className="text-sm text-gray-500">{type}</p>

      <div className="h-2 bg-gray-200 rounded">
        <div
          className="h-2 bg-indigo-500 rounded"
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="text-sm">
        {current} / {target}
      </p>

      <button
        onClick={() => setOpen(true)}
        className="text-indigo-600 text-sm"
      >
        Log today
      </button>

      {open && (
        <LogKpiModal
          kpiId={1 /* truyền từ parent */}
          onSuccess={() => window.location.reload()}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
