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

// Reuse komponen ItemLending untuk menjaga konsistensi layout
import { StatCard } from '@/components/ui/ItemLending/Dashboard/StatCard';
import { LendingChart } from '@/components/ui/ItemLending/Dashboard/LendingChart';
import { LendingSidebar } from '@/components/ui/ItemLending/Dashboard/LendingSidebar';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
	stats: {
		totalAdministrator: number;
		totalMahasiswa: number;
		totalLaboratorium: number;
		labDigunakan: number;
		menungguPersetujuan: number
		jadwalTerdekat: any;
	};
	chartData: number[];
	year: number;
	latestMahasiswa: any;
	firstAdministrator: any;
}

export default function Dashboard({ stats, chartData, year, latestMahasiswa, firstAdministrator }: Props) {
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
		router.get(route('lab-lending.dashboard'), { year: e.target.value }, { preserveState: true });
	};

	const currentYear = new Date().getFullYear();
	const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

	React.useEffect(() => {
		setChartKey(prev => prev + 1);
	}, [chartData]);

	return (
		<AppLayout>
			<Head title="Beranda - Peminjaman Lab" />
			<div className="p-6">
				<header className="mb-6">
					<h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Dashboard Peminjaman Lab</h2>
					<p className="text-sm text-gray-500 dark:text-gray-400">Ringkasan aktivitas peminjaman laboratorium.</p>
				</header>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
					{auth.user?.role === 'mahasiswa' ? (
						<>
							<StatCard
								color="blue"
								label="Lab Digunakan"
								value={stats.labDigunakan ?? 0}
								isItem={true}
							/>
							<StatCard
								color="amber"
								label="Menunggu Persetujuan"
								value={stats.menungguPersetujuan ?? 0}
								isItem={true}
							/>
							<StatCard
								color="red"
								label="Jadwal Terdekat"
								value={stats.jadwalTerdekat ?? '-'}
							/>
						</>
					) : (
						<>
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
								label="Total Laboratorium"
								value={stats.totalLaboratorium}
								isLab={true}
							/>
						</>
					)}
				</div>

				<div className="flex flex-col lg:flex-row gap-8 mt-8 min-w-0 w-full">
					<LendingChart
						chartData={chartData}
						year={year}
						years={years}
						onYearChange={handleYearChange}
						chartKey={chartKey}
					/>
					<LendingSidebar
						roleLabel={roleLabel}
						user={sourceUser}
						latestMahasiswa={latestMahasiswa}
					/>
				</div>
			</div>
		</AppLayout>
	);
}
