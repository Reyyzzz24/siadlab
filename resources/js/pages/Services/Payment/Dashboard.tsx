import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { SharedData } from '@/types';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { DashboardSidebar } from '@/components/ui/Payment/DashBoard/DashboardSidebar';
import { RevenueChart } from '@/components/ui/Payment/DashBoard/RevenueCard';
import { StatCard } from '@/components/ui/Payment/DashBoard/StatCard';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
    auth: {
        user: {
            id: number;
            name: string;
            role: 'admin' | 'petugas' | 'mahasiswa';
            // tambahkan properti lain yang ada di model User Anda
        } | null;
    };
    stats: {
        totalAdministrator: number;
        totalMahasiswa: number;
        totalPembayaran: string; // Total seluruh pendapatan (untuk admin)
        totalTagihanAktif?: string;
        totalSudahDibayar?: string;
        jatuhTempoTerdekat?: string;
    };
    chartData: number[];
    tahunDipilih: number;
    latestMahasiswa: any;
    firstAdministrator: any;
}

export default function Dashboard({ stats, chartData, tahunDipilih, latestMahasiswa, firstAdministrator }: Props) {
    const { auth } = usePage<SharedData>().props;
    const [chartKey, setChartKey] = React.useState(0);

    const sourceUser = auth.user || firstAdministrator;
    const roleLabel = sourceUser?.role === 'admin'
        ? 'Administrator'
        : sourceUser?.role === 'petugas'
            ? 'Petugas'
            : sourceUser?.role === 'user'
                ? 'User'
                : 'Mahasiswa';

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.get(route('payment.dashboard'), { year: e.target.value }, { preserveState: true });
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 4 }, (_, i) => currentYear - i);

    React.useEffect(() => { setChartKey(prev => prev + 1); }, [chartData]);

    return (
        <AppLayout>
            <Head title="Beranda - Pembayaran" />
            <div className="p-6">
                <header className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Tampilan awal halaman.</p>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                    {auth.user?.role === 'mahasiswa' ? (
                        <>
                            <StatCard
                                color="blue"
                                label="Total Tagihan Aktif"
                                value={stats.totalTagihanAktif ?? 'Rp 0'}
                                isCurrency
                            />
                            <StatCard
                                color="green"
                                label="Sudah Dibayar"
                                value={stats.totalSudahDibayar ?? 'Rp 0'}
                                isCurrency
                            />
                            <StatCard
                                color="red"
                                label="Jatuh Tempo Terdekat"
                                value={stats.jatuhTempoTerdekat ?? '-'}
                            />
                        </>
                    ) : (
                        <>
                            {/* Tampilan untuk Admin / Petugas */}
                            <StatCard
                                color="blue"
                                label="Total Administrator"
                                value={stats.totalAdministrator}
                            />
                            <StatCard
                                color="red"
                                label="Total Mahasiswa"
                                value={stats.totalMahasiswa}
                            />
                            <StatCard
                                color="green"
                                label="Total Tagihan Anda"
                                value={stats.totalPembayaran}
                                isCurrency
                            />
                        </>
                    )}
                </div>

                <div className="flex flex-col lg:flex-row gap-8 mt-8 min-w-0 w-full">
                    <RevenueChart
                        chartData={chartData}
                        tahunDipilih={tahunDipilih}
                        years={years}
                        onYearChange={handleYearChange}
                        chartKey={chartKey}
                    />
                    <DashboardSidebar
                        roleLabel={roleLabel}
                        user={sourceUser}
                        latestMahasiswa={latestMahasiswa}
                    />
                </div>
            </div>
        </AppLayout>
    );
}