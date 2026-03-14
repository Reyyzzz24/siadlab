import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const AdminChart = ({ chartData = [], year, years = [], onYearChange, chartKey }: any) => {
    // Memberikan nilai default [] untuk menghindari error undefined
    const safeChartData = chartData || [];
    const safeYears = years || [];

    const chartOptions: ChartOptions<"bar"> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: true }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { stepSize: 1 },
                grid: {
                    display: true,
                    drawOnChartArea: true,
                } as any
            },
            x: { grid: { display: false } }
        }
    };

    const data = {
        // Menggunakan ?. agar tidak error saat mapping
        labels: safeChartData.map((d: any) => d.name),
        datasets: [{
            label: 'Total User',
            data: safeChartData.map((d: any) => d.total),
            backgroundColor: 'rgba(99, 102, 241, 0.7)',
            borderRadius: 10,
            maxBarThickness: 30,
        }]
    };

    return (
        <div className="flex-1 min-w-0 bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
                    Pertumbuhan User Tahun {year}
                </h3>
                <select
                    value={year}
                    onChange={onYearChange}
                    className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-xs outline-none bg-white dark:bg-gray-700 dark:text-white"
                >
                    {safeYears.map((y: number) => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
            </div>
            <div className="relative w-full h-[250px]">
                {/* Pastikan chartData memiliki isi sebelum merender Bar */}
                {safeChartData.length > 0 ? (
                    <Bar key={chartKey} data={data} options={chartOptions} redraw />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                        Tidak ada data untuk tahun ini
                    </div>
                )}
            </div>
        </div>
    );
};