import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

type KPIChartProps = {
  labels: string[];
  values: number[];
};

export default function KpiChart({ labels, values }: KPIChartProps) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <Bar
        data={{
          labels,
          datasets: [
            {
              label: 'KPI Progress',
              data: values,
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { display: false },
          },
        }}
      />
    </div>
  );
}
