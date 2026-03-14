import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { StatCard } from './Dashboard Partials/StatCard';
import { AdminChart } from './Dashboard Partials/AdminCart'; 
import { AdminSidebar } from './Dashboard Partials/AdminSidebar';

interface DashboardProps {
    stats: {
        total_mahasiswa: number;
        total_petugas: number;
        total_admin: number;
    };
    chartData: any[];
    selectedYear: number;
    availableYears: number[];
}

export default function Dashboard({ stats, chartData, selectedYear, availableYears }: DashboardProps) {
    const { auth } = usePage<any>().props;
    const [chartKey, setChartKey] = React.useState(0);

    // Sinkronisasi key saat data berubah
    React.useEffect(() => {
        setChartKey(prev => prev + 1);
    }, [chartData]);

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.get(
            route('admin.dashboard'),
            { year: e.target.value },
            { preserveState: true, preserveScroll: true }
        );
    };

    return (
        <AppLayout>
            <Head title="Admin Dashboard" />
            
            <div className="p-6">
                <header className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Ringkasan data sistem SIADLAB.</p>
                </header>

                {/* Grid Statistik */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                    <StatCard color="blue" label="Total Mahasiswa" value={stats.total_mahasiswa} />
                    <StatCard color="amber" label="Total Petugas" value={stats.total_petugas} />
                    <StatCard color="green" label="Total Admin" value={stats.total_admin} />
                </div>

                {/* Kontainer Utama: Chart + Sidebar */}
                <div className="flex flex-col lg:flex-row gap-8 mt-8 min-w-0 w-full">
                    <div className="flex-1 min-w-0">
                        <AdminChart
                            chartData={chartData}
                            year={selectedYear}
                            years={availableYears}
                            onYearChange={handleYearChange}
                            chartKey={chartKey}
                        />
                    </div>
                    
                    <div className="lg:w-80 lg:shrink-0">
                        <AdminSidebar
                            roleLabel="Administrator"
                            user={auth?.user}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}