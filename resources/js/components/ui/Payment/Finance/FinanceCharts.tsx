// components/Finance/FinanceCharts.tsx
import { Doughnut } from 'react-chartjs-2';

export const FinanceDonutChart = ({ title, data, options }: any) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-4 uppercase tracking-tight">{title}</h3>
        <div className="relative w-full h-52 flex justify-center items-center">
            <Doughnut data={data} options={options} />
        </div>
    </div>
);