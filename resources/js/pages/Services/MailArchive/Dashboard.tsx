import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { SharedData } from '@/types';
import { UserIcon, EnvelopeIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

// Import komponen yang baru dipecah
import { MailStatCard } from '@/components/ui/MailArchive/Dashboard/MailStatCard';
import { MailChart } from '@/components/ui/MailArchive/Dashboard/MailChart';
import { MailSidebar } from '@/components/ui/MailArchive/Dashboard/MailSidebar';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
    stats: {
        totalAdministrator: number;
        totalSuratMasuk: number;
        totalSuratKeluar: number;
    };
    chart: {
        year: number;
        dataMasuk: number[];
        dataKeluar: number[];
    };
    suratTerbaru: any;
    roleLabel: string;
}

export default function Dashboard({ roleLabel, stats, chart, suratTerbaru }: Props) {
    const { auth } = usePage<SharedData>().props;
    const [chartKey, setChartKey] = React.useState(0);

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        router.get(route('arsipsurat.index'), { year: e.target.value }, { preserveState: true });
    };

    React.useEffect(() => {
        setChartKey(prev => prev + 1);
    }, [chart]);

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    return (
        <AppLayout>
            <Head title="Beranda - Arsip Surat" />
            <div className="p-6">
                <header className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Dashboard Arsip Surat</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Ringkasan manajemen surat masuk dan keluar.</p>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                    <MailStatCard color="blue" label="Total Administrator" value={stats.totalAdministrator} icon={UserIcon} />
                    <MailStatCard color="green" label="Total Surat Masuk" value={stats.totalSuratMasuk} icon={EnvelopeIcon} />
                    <MailStatCard color="orange" label="Total Surat Keluar" value={stats.totalSuratKeluar} icon={PaperAirplaneIcon} />
                </div>

                <div className="flex flex-col lg:flex-row gap-8 mt-8 min-w-0 w-full">
                    <MailChart
                        chart={chart}
                        years={years}
                        onYearChange={handleYearChange}
                        chartKey={chartKey}
                    />
                    <MailSidebar
                        roleLabel={roleLabel}
                        user={auth.user}
                        suratTerbaru={suratTerbaru}
                    />
                </div>
            </div>
        </AppLayout>
    );
}