// components/Dashboard/RevenueChart.tsx
import { Bar } from 'react-chartjs-2';

export const RevenueChart = ({ chartData, tahunDipilih, years, onYearChange, chartKey }: any) => {
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { callback: (val: any) => 'Rp ' + val.toLocaleString('id-ID') }
            }
        }
    };

    const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
            label: 'Total Pendapatan',
            data: chartData,
            backgroundColor: 'rgba(34, 197, 94, 0.6)',
            borderRadius: 8,
        }]
    };

    return (
        <div className="flex-1 min-w-0 bg-white dark:bg-gray-800 rounded-lg p-6 shadow border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">Pembayaran Tahun {tahunDipilih}</h3>
                <select
                    value={tahunDipilih}
                    onChange={onYearChange}
                    className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 dark:text-white"
                >
                    {years.map((y: number) => (
                        <option key={y} value={y}>Tahun {y}</option>
                    ))}
                </select>
            </div>
            <div className="relative w-full h-[300px]">
                <Bar key={chartKey} data={data} options={chartOptions} redraw />
            </div>
        </div>
    );
};