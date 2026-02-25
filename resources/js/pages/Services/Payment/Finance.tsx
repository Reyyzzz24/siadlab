import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { FinanceStats } from '@/components/ui/Payment/Finance/FinanceStats';
import { FinanceDonutChart } from '@/components/ui/Payment/Finance/FinanceCharts';

ChartJS.register(ArcElement, Tooltip, Legend);

// FIX 1: Tambahkan Interface untuk Item Pendapatan
interface PendapatanItem {
    nama_pembayar: string;
    kategori?: string;
    nominal: number;
}

// FIX 2: Tambahkan Interface untuk Chart Data
interface ChartDataItem {
    kategori: string;
    total: number;
}

// FIX 3: Tambahkan Interface Props Utama
interface Props {
    saldo_kas: number;
    total_menunggu_konfirmasi: number;
    tagihan_lunas_count: number;
    tagihan_menunggak_count: number;
    rincian_pendapatan: PendapatanItem[];
    chartData: ChartDataItem[];
}

export default function Finance({
    saldo_kas = 0,
    total_menunggu_konfirmasi = 0,
    tagihan_lunas_count = 0,
    tagihan_menunggak_count = 0,
    rincian_pendapatan = [],
    chartData = []
}: Props) {

    const formatRupiah = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
        }).format(value);
    };

    // Konfigurasi Data Chart
    const incomeData = {
        // FIX 4: Berikan tipe eksplisit pada parameter 'item'
        labels: chartData.map((item: ChartDataItem) => item.kategori || 'Lainnya'),
        datasets: [{
            data: chartData.map((item: ChartDataItem) => item.total),
            backgroundColor: ['#4c64b7', '#48bb78', '#ed8936', '#9f7aea', '#38b2ac'],
        }]
    };

    const expenseData = {
        labels: ['Event', 'Study Tour', 'Gaji', 'Ops'],
        datasets: [{
            data: [1000000, 500000, 800000, 200000],
            backgroundColor: ['#e53e3e', '#ecc94b', '#4299e1', '#a0aec0'],
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom' as const, labels: { boxWidth: 8, font: { size: 10 } } },
        }
    };

    return (
        <AppLayout>
            <Head title="Keuangan" />
            <div className="p-6">
                <header>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Keuangan</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Ringkasan kas dan transaksi sistem.</p>
                </header>

                <FinanceStats
                    saldo={formatRupiah(saldo_kas)}
                    konfirmasi={formatRupiah(total_menunggu_konfirmasi)}
                    lunas={tagihan_lunas_count.toString()}
                    tunggakan={tagihan_menunggak_count.toString()}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Kolom Kiri */}
                    <div className="space-y-5">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 uppercase tracking-tight">Rincian Pendapatan</h3>
                            <Table>
                                <Thead>
                                    <Tr>
                                        {/* Tambahkan Header Nomor */}
                                        <Th center>No</Th>
                                        <Th>Nama</Th>
                                        <Th>Kategori</Th>
                                        <Th>Nominal</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {rincian_pendapatan.slice(0, 5).map((item: PendapatanItem, i: number) => (
                                        <Tr key={i}>
                                            <Td center>{i + 1}</Td>
                                            <Td className="font-medium">{item.nama_pembayar}</Td>
                                            <Td>{item.kategori || 'Umum'}</Td>
                                            <Td>{formatRupiah(item.nominal)}</Td>
                                        </Tr>
                                    ))}
                                </Tbody>
                            </Table>
                        </div>
                        <FinanceDonutChart title="Pengeluaran" data={expenseData} options={chartOptions} />
                    </div>

                    {/* Kolom Kanan */}
                    <div className="space-y-5">
                        <FinanceDonutChart title="Sumber Pendapatan" data={incomeData} options={chartOptions} />
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 uppercase tracking-tight">Rincian Pengeluaran</h3>
                            <Table>
                                <Thead>
                                    <Tr>
                                        <Th center>No</Th>
                                        <Th>Kategori</Th>
                                        <Th>Jumlah</Th>
                                        <Th>Aksi</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    <Tr>
                                        {/* Tambahkan nomor di sini */}
                                        <Td center>1</Td>
                                        <Td className='font-medium'>Event Kampus</Td>
                                        <Td>1.000.000</Td>
                                        <Td>
                                            <button className="text-blue-500 hover:text-blue-700 text-sm font-medium">
                                                View
                                            </button>
                                        </Td>
                                    </Tr>
                                </Tbody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout >
    );
}