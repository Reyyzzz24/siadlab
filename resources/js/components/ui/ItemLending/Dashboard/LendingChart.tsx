// components/ui/ItemLending/LendingChart.tsx
import { Bar } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';

export const LendingChart = ({ chartData, year, years, onYearChange, chartKey }: any) => {
    // Memberikan tipe ChartOptions<"bar"> membantu TypeScript memvalidasi properti
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
                ticks: { 
                    stepSize: 1 
                },
                grid: { 
                    // Pastikan penulisan properti grid sesuai
                    display: true,
                    drawOnChartArea: true,
                    // Jika borderDash menyebabkan error, pastikan versi chart.js mendukungnya di sini
                    // atau gunakan inline cast (as any) jika properti kustom diperlukan
                    tickBorderDash: [2, 4], 
                } as any // Menggunakan 'as any' pada grid adalah cara tercepat mengatasi ketatnya tipe data Chart.js
            },
            x: { 
                grid: { display: false } 
            }
        }
    };

    const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
            label: 'Peminjaman',
            data: chartData,
            backgroundColor: (context: any) => {
                const index = context.dataIndex;
                const currentMonth = new Date().getMonth();
                // Mengikuti logika peminjaman.blade.php
                return index === currentMonth ? 'rgba(99, 102, 241, 0.7)' : 'rgba(147, 197, 253, 0.5)';
            },
            borderRadius: 10,
            maxBarThickness: 30,
        }]
    };

    return (
        <div className="flex-1 min-w-0 bg-white dark:bg-gray-800 rounded-lg p-6 shadow border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">Peminjaman Tahun {year}</h3>
                <select
                    value={year}
                    onChange={onYearChange}
                    className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 text-xs outline-none bg-white dark:bg-gray-700 dark:text-white"
                >
                    {years.map((y: number) => (
                        <option key={y} value={y}>{y}</option>
                    ))}
                </select>
            </div>
            <div className="relative w-full h-[250px]">
                {/* Menambahkan redraw={true} agar grafik diperbarui saat filter tahun berubah */}
                <Bar key={chartKey} data={data} options={chartOptions} redraw />
            </div>
        </div>
    );
};