import { useState } from 'react';
import { logKpi } from '../../api/kpi';

type Props = {
  kpiId: number;
  onSuccess: () => void;
  onClose: () => void;
};

export default function LogKpiModal({
  kpiId,
  onSuccess,
  onClose,
}: Props) {
  const [value, setValue] = useState(1);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await logKpi(kpiId, value);
      onSuccess();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
      <div className="bg-white rounded p-6 w-80 space-y-4">
        <h3 className="font-bold text-lg">Log KPI</h3>

        <input
          type="number"
          min={1}
          value={value}
          onChange={(e) => setValue(+e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Cancel</button>
          <button
            disabled={loading}
            onClick={submit}
            className="bg-indigo-600 text-white px-4 py-1 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
