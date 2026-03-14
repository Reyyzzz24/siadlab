<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminPanelController extends Controller
{
    public function index(Request $request)
    {
        $selectedYear = $request->input('year', date('Y'));

        $stats = [
            'total_mahasiswa' => User::where('role', 'mahasiswa')->count(),
            'total_petugas'   => User::where('role', 'petugas')->count(),
            'total_admin'     => User::where('role', 'admin')->count(),
        ];

        // Ambil data per bulan dari DB
        $dataFromDb = User::selectRaw('MONTH(created_at) as month, count(*) as total')
            ->whereYear('created_at', $selectedYear)
            ->groupBy('month')
            ->pluck('total', 'month');

        // Mapping agar selalu 12 bulan
        $chartData = [];
        for ($m = 1; $m <= 12; $m++) {
            $chartData[] = [
                'name'  => date('M', mktime(0, 0, 0, $m, 1)),
                'total' => $dataFromDb->get($m, 0), // Default 0 jika tidak ada data
            ];
        }

        return Inertia::render('Admin/Dashboard', [
            'stats'          => $stats,
            'chartData'      => $chartData,
            'selectedYear'   => (int)$selectedYear,
            'availableYears' => User::selectRaw('YEAR(created_at) as year')
                ->whereNotNull('created_at')
                ->distinct()
                ->orderBy('year', 'desc')
                ->pluck('year')
                ->toArray(),
        ]);
    }
}
