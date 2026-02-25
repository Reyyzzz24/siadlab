import { Bar } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';

export const MailChart = ({ chart, years, onYearChange, chartKey }: any) => {
    const chartOptions: ChartOptions<"bar"> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
            legend: { position: 'bottom' },
            tooltip: { enabled: true }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { stepSize: 1 },
                grid: { tickBorderDash: [2, 4] } as any
            },
            x: { grid: { display: false } }
        }
    };

    const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
        datasets: [
            {
                label: 'Surat Masuk',
                data: chart.dataMasuk,
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderRadius: 5,
            },
            {
                label: 'Surat Keluar',
                data: chart.dataKeluar,
                backgroundColor: 'rgba(249, 115, 22, 0.7)',
                borderRadius: 5,
            }
        ]
    };

    return (
        <div className="flex-1 min-w-0 bg-white dark:bg-gray-800 rounded-lg p-6 shadow border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">Grafik Surat Tahun {chart.year}</h3>
                <select
                    value={chart.year}
                    onChange={onYearChange}
                    className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-xs outline-none bg-white dark:bg-gray-700 dark:text-white"
                >
                    {years.map((y: number) => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
            </div>
            <div className="relative w-full h-[300px]">
                <Bar key={chartKey} data={data} options={chartOptions} redraw />
            </div>
        </div>
    );
};