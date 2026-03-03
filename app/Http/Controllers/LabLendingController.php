<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Laboratorium;
use App\Models\PeminjamanLab;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use App\Models\NotificationCustom;

class LabLendingController extends Controller
{
    public function dashboard(Request $request)
    {
        $year = $request->input('year', date('Y'));
        $user = Auth::user();

        // Inisialisasi variabel untuk Mahasiswa
        $labDigunakan = 0;
        $menungguPersetujuan = 0;
        $jadwalTerdekat = '-';

        // 1. Logika Khusus Mahasiswa
        if ($user && $user->role === 'mahasiswa') {
            // A. Lab yang sedang aktif digunakan (Status: process)
            $labDigunakan = PeminjamanLab::where('user_id', $user->id)
                ->where('status', 'dipinjam')
                ->count();

            // B. Menunggu Persetujuan (Status: booked)
            $menungguPersetujuan = PeminjamanLab::where('user_id', $user->id)
                ->where('status', 'booked')
                ->count();

            // C. Jadwal Penggunaan Terdekat (Mengambil 1 data terbaru baik yang akan datang atau baru saja lewat)
            $peminjamanTerdekat = PeminjamanLab::where('user_id', $user->id)
                ->whereIn('status', ['booked', 'process', 'selesai']) // Tambahkan 'selesai' jika ingin yang baru lewat tetap tampil
                ->orderBy('waktu_mulai', 'desc') // Ambil yang paling baru secara urutan waktu
                ->first();

            if ($peminjamanTerdekat) {
                $mulai = \Carbon\Carbon::parse($peminjamanTerdekat->waktu_mulai);
                $selesai = \Carbon\Carbon::parse($peminjamanTerdekat->waktu_selesai);

                if (now()->between($mulai, $selesai)) {
                    $jadwalTerdekat = 'Sedang Berlangsung s/d ' . $selesai->format('H:i');
                } elseif ($selesai->isPast()) {
                    // Jika sudah lewat di hari yang sama
                    $jadwalTerdekat = 'Selesai pada ' . $selesai->format('H:i');
                } elseif ($mulai->isToday()) {
                    $jadwalTerdekat = 'Hari ini: ' . $mulai->format('H:i');
                } else {
                    $jadwalTerdekat = $mulai->translatedFormat('d M Y');
                }
            } else {
                $jadwalTerdekat = 'Tidak ada jadwal';
            }
        }

        // 2. Data Chart (Dinamis: Jika mahasiswa, hanya data dia sendiri)
        $chartQuery = PeminjamanLab::select(
            DB::raw('MONTH(created_at) as month'),
            DB::raw('count(*) as total')
        )
            ->whereYear('created_at', $year)
            ->groupBy('month')
            ->orderBy('month');

        if ($user->role === 'mahasiswa') {
            $chartQuery->where('user_id', $user->id);
        }

        $chartDataRaw = $chartQuery->get();
        $chartData = array_fill(0, 12, 0);
        foreach ($chartDataRaw as $data) {
            $chartData[$data->month - 1] = $data->total;
        }

        // 3. Statistik Global & Personal
        $stats = [
            'totalAdministrator' => User::whereIn('role', ['admin', 'administrator'])->count(),
            'totalMahasiswa'     => User::where('role', 'mahasiswa')->count(),
            'totalLaboratorium'  => Laboratorium::count(),

            // Data Mahasiswa
            'labDigunakan'        => $labDigunakan,
            'menungguPersetujuan' => $menungguPersetujuan,
            'jadwalTerdekat'      => $jadwalTerdekat,
        ];

        return Inertia::render('Services/LabLending/Dashboard', [
            'auth' => [
                'user' => $user
            ],
            'stats'              => $stats,
            'chartData'          => $chartData,
            'year'               => (int) $year,
            'latestMahasiswa'    => User::where('role', 'mahasiswa')->latest()->first(),
            'firstAdministrator' => User::whereIn('role', ['admin', 'administrator'])->first(),
        ]);
    }

    public function list(Request $request)
    {
        $filters = $request->only(['search', 'status']);

        $query = PeminjamanLab::with(['laboratorium', 'user', 'petugas', 'admin'])
            ->when($request->search, function ($q, $search) {
                $q->where(function ($qq) use ($search) {
                    $qq->where('nama_peminjam', 'like', "%{$search}%")
                        ->orWhereHas('laboratorium', function ($q2) use ($search) {
                            $q2->where('nama_lab', 'like', "%{$search}%");
                        });
                });
            })
            ->when($request->status, function ($q, $status) {
                $q->where('status', $status);
            })
            ->latest();

        $peminjamans = $query->paginate(10)->withQueryString();

        return Inertia::render('Services/LabLending/LendingList', [
            'peminjamans' => $peminjamans,
            'filters' => $filters,
        ]);
    }

    public function lendNow(Request $request)
    {
        $peminjamans = PeminjamanLab::with(['user', 'laboratorium', 'petugas', 'admin'])
            ->where('user_id', Auth::id())
            ->whereIn('status', ['booked', 'disetujui', 'dipinjam', 'proses_kembali'])
            ->latest()
            ->get()
            ->map(function ($p) {
                $tglPinjam = Carbon::parse($p->tanggal_pinjam);
                $tglKembali = $p->tanggal_kembali ? Carbon::parse($p->tanggal_kembali) : now();

                $p->durasi_hari = $tglPinjam->diffInDays($tglKembali);

                if ($p->status === 'dipinjam' && $p->tanggal_kembali && Carbon::now()->gt(Carbon::parse($p->tanggal_kembali))) {
                    $p->status = 'terlambat';
                }
                return $p;
            });

        $laboratoriesAvailable = Laboratorium::query()
            ->where('status', 'available')
            ->select('id', 'id_lab', 'nama_lab', 'status')
            ->orderBy('nama_lab')
            ->get()
            ->toArray();

        $totalTransactions = PeminjamanLab::where('user_id', Auth::id())->count();

        return Inertia::render('Services/LabLending/LendNow', [
            'peminjamans' => $peminjamans,
            'laboratoriesAvailable' => $laboratoriesAvailable,
            'totalTransactions' => $totalTransactions,
        ]);
    }

    public function history(Request $request)
    {
        $query = PeminjamanLab::with(['laboratorium', 'user', 'petugas', 'admin'])
            ->whereIn('status', ['selesai', 'ditolak', 'terlambat']);

        $user = Auth::user();

        if ($user->role !== 'admin' && $user->role !== 'petugas') {
            $query->where('user_id', $user->id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('nama_peminjam', 'like', '%' . $request->search . '%')
                    ->orWhereHas('laboratorium', function ($qb) use ($request) {
                        $qb->where('nama_lab', 'like', '%' . $request->search . '%');
                    })
                    ->orWhereHas('user', function ($qu) use ($request) {
                        $qu->where('name', 'like', '%' . $request->search . '%');
                    });
            });
        }

        // Ganti ->get() menjadi ->paginate()
        // 10 adalah jumlah data per halaman, silakan sesuaikan
        $peminjamans = $query->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Services/LabLending/History', [
            'peminjamans' => $peminjamans,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function laboratories(Request $request)
    {
        $query = Laboratorium::query();

        // Gunakan conditional when agar query lebih bersih
        $query->when($request->search, function ($q, $search) {
            $q->where(function ($inner) use ($search) {
                $inner->where('nama_lab', 'like', '%' . $search . '%')
                    ->orWhere('id_lab', 'like', '%' . $search . '%');
            });
        });

        $query->when($request->status, function ($q, $status) {
            $q->where('status', $status);
        });

        // Ganti .get() menjadi .paginate()
        // withQueryString() memastikan filter ?search=... tetap terbawa saat pindah halaman
        $labs = $query->orderBy('nama_lab')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Services/LabLending/Laboratories', [
            'labs'    => $labs,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function storeLab(Request $request)
    {
        $validated = $request->validate([
            // Hapus 'unique:laboratoriums,nama_lab' agar nama bisa sama
            'nama_lab'  => 'required|string|max:255',
            'lokasi'    => 'nullable|string|max:255',
            'kapasitas' => 'nullable|integer|min:1',
            'status'    => 'nullable|in:available,unavailable',
        ]);

        // 1. Ambil record terakhir untuk menentukan nomor urut berikutnya
        $lastRecord = Laboratorium::withTrashed()
            ->where('id_lab', 'like', 'LAB-%')
            ->orderByRaw('CAST(SUBSTRING(id_lab, 5) AS UNSIGNED) DESC')
            ->first();

        if ($lastRecord) {
            $parts = explode('-', $lastRecord->id_lab);
            $lastNumber = isset($parts[1]) ? (int)$parts[1] : 0;
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        // 2. Format ID baru: LAB-001
        $newId = 'LAB-' . str_pad($newNumber, 3, '0', STR_PAD_LEFT);

        // 3. Proteksi double-check agar ID benar-benar unik di database
        while (Laboratorium::withTrashed()->where('id_lab', $newId)->exists()) {
            $newNumber++;
            $newId = 'LAB-' . str_pad($newNumber, 3, '0', STR_PAD_LEFT);
        }

        $validated['id_lab'] = $newId;
        $validated['status'] = $validated['status'] ?? 'available';

        Laboratorium::create($validated);

        return redirect()->back()->with('success', "Laboratorium $newId ($request->nama_lab) berhasil ditambahkan.");
    }

    // Update existing lab
    public function updateLab(Request $request, $id)
    {
        $validated = $request->validate([
            'nama_lab' => 'required|string|max:255',
            'lokasi' => 'nullable|string|max:255',
            'kapasitas' => 'nullable|integer',
            'status' => 'nullable|in:available,unavailable,maintenance',
        ]);

        $lab = Laboratorium::findOrFail($id);
        $lab->update($validated);

        return redirect()->back()->with('success', 'Laboratorium berhasil diperbarui.');
    }

    // Delete lab
    public function deleteSelected(Request $request)
    {
        $selectedIds = $request->input('selected_ids', []);

        if (empty($selectedIds)) {
            return redirect()->back()->with('error', 'Tidak ada laboratorium yang dipilih.');
        }

        $items = Laboratorium::whereIn('id', $selectedIds)
            ->whereIn('status', ['available', 'unavailable', 'maintenance'])
            ->get();

        if ($items->isEmpty()) {
            return redirect()->back()->with('error', 'Gagal menghapus. Laboratorium mungkin sedang dipesan atau sedang digunakan.');
        }

        $deletedCount = $items->count();

        Laboratorium::whereIn('id', $items->pluck('id'))->delete();

        return redirect()->back()->with('success', "$deletedCount laboratorium berhasil dihapus.");
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'laboratorium_id' => 'required|exists:laboratoriums,id',
            'nama_peminjam' => 'required|string|max:255',
            'tanggal_pinjam' => 'required|date',
            'waktu_mulai' => 'nullable|string',
            'waktu_selesai' => 'nullable|string',
            'keperluan' => 'nullable|string',
        ]);

        $lab = Laboratorium::find($validated['laboratorium_id']);
        if (!$lab || $lab->status !== 'available') {
            return redirect()->back()->with('error', 'Laboratorium tidak tersedia.');
        }

        $pinjam = new PeminjamanLab();
        $pinjam->user_id = Auth::id();
        $pinjam->id_transaksi = uniqid('txn_');
        $pinjam->nama_peminjam = $validated['nama_peminjam'];
        $pinjam->laboratorium_id = $validated['laboratorium_id'];
        $pinjam->tanggal_pinjam = $validated['tanggal_pinjam'];
        $pinjam->waktu_mulai = $validated['waktu_mulai'] ?? null;
        $pinjam->waktu_selesai = $validated['waktu_selesai'] ?? null;
        $pinjam->keperluan = $validated['keperluan'] ?: '-';
        $pinjam->status = 'booked';
        $pinjam->save();

        return redirect()->back()->with('success', 'Peminjaman laboratorium berhasil dicatat.');
    }

    public function cancel($id)
    {
        $pinjam = PeminjamanLab::findOrFail($id);
        if ($pinjam->status !== 'booked') {
            return redirect()->back()->with('error', 'Hanya peminjaman dengan status booked yang bisa dibatalkan.');
        }
        $pinjam->update(['status' => 'selesai']);
        return redirect()->back()->with('success', 'Peminjaman berhasil dibatalkan.');
    }

    public function approve($id)
    {
        $user = Auth::user();

        if (!$user || !in_array($user->role, ['admin', 'petugas'])) {
            return redirect()->back()->with('error', 'Izin ditolak.');
        }

        DB::transaction(function () use ($id, $user) {

            $pinjam = PeminjamanLab::lockForUpdate()->findOrFail($id);

            // Cegah double approve
            if ($pinjam->status !== 'booked') {
                abort(400, 'Hanya booking yang bisa disetujui.');
            }

            if ($user->role === 'admin') {
                $pinjam->admin_id = $user->id;
                $pinjam->petugas_id = null;
            } else {
                $pinjam->petugas_id = $user->id;
                $pinjam->admin_id = null;
            }

            $pinjam->status = 'dipinjam';
            $pinjam->save();

            Laboratorium::where('id', $pinjam->laboratorium_id)
                ->lockForUpdate()
                ->update([
                    'status' => 'unavailable'
                ]);
        });

        return redirect()->back()->with('success', 'Booking disetujui.');
    }


    public function reject(Request $request, $id)
    {
        if (!Auth::user() || !in_array(Auth::user()->role, ['admin', 'petugas'])) {
            return redirect()->back()->with('error', 'Izin ditolak.');
        }

        $pinjam = PeminjamanLab::findOrFail($id);
        if ($pinjam->status !== 'booked') {
            return redirect()->back()->with('error', 'Hanya booking yang dapat ditolak.');
        }

        $validated = $request->validate([
            'alasan' => 'nullable|string|max:2000'
        ]);

        $pinjam->update(['status' => 'ditolak', 'alasan' => $validated['alasan'] ?? null]);

        if ($pinjam->user_id) {
            NotificationCustom::create([
                'user_id' => $pinjam->user_id,
                'type' => 'peminjaman_lab_ditolak',
                'data' => [
                    'message' => 'Peminjaman laboratorium Anda ditolak.',
                    'alasan' => $validated['alasan'] ?? null,
                    'peminjaman_id' => $pinjam->id,
                ],
                'is_read' => false,
            ]);
        }

        return redirect()->back()->with('success', 'Booking ditolak.');
    }

    public function requestReturn($id)
    {
        $pinjam = PeminjamanLab::findOrFail($id);
        if (!in_array($pinjam->status, ['dipinjam', 'terlambat'])) {
            return redirect()->back()->with('error', 'Status tidak valid untuk pengembalian.');
        }
        $pinjam->update(['status' => 'proses_kembali']);
        return redirect()->back()->with('success', 'Permintaan pengembalian dikirim.');
    }

    public function approveBack($id)
    {
        $user = Auth::user();

        if (!$user || !in_array($user->role, ['admin', 'petugas'])) {
            return redirect()->back()->with('error', 'Izin ditolak.');
        }

        DB::transaction(function () use ($id, $user) {

            $pinjam = PeminjamanLab::lockForUpdate()->findOrFail($id);

            // Validasi status
            if (!in_array($pinjam->status, ['dipinjam', 'proses_kembali'])) {
                abort(400, 'Status peminjaman tidak valid.');
            }

            if ($user->role === 'petugas') {
                $pinjam->petugas_id = $user->id;
                $pinjam->admin_id = null;
            } else {
                $pinjam->admin_id = $user->id;
                $pinjam->petugas_id = null;
            }

            $pinjam->status = 'selesai';
            $pinjam->save();

            Laboratorium::where('id', $pinjam->laboratorium_id)
                ->lockForUpdate()
                ->update([
                    'status' => 'available'
                ]);
        });

        return redirect()->back()->with('success', 'Pengembalian berhasil dikonfirmasi.');
    }


    public function kembalikanSelected(Request $request)
    {
        $ids = $request->input('ids', []);
        if (empty($ids)) return redirect()->back()->with('error', 'Pilih data.');

        $updated = PeminjamanLab::whereIn('id', $ids)
            ->whereIn('status', ['dipinjam', 'terlambat'])
            ->update(['status' => 'proses_kembali']);

        return redirect()->back()->with('success', "Permintaan terkirim untuk {$updated} data.");
    }

    public function rejectBack(Request $request, $id)
    {
        if (!Auth::user() || !in_array(Auth::user()->role, ['admin', 'petugas'])) {
            return redirect()->back()->with('error', 'Izin ditolak.');
        }

        $pinjam = PeminjamanLab::findOrFail($id);
        if ($pinjam->status !== 'proses_kembali') {
            return redirect()->back()->with('error', 'Hanya status proses_kembali yang dapat ditolak.');
        }

        $validated = $request->validate([
            'alasan' => 'nullable|string|max:2000'
        ]);

        $pinjam->update(['status' => 'dipinjam', 'alasan' => $validated['alasan'] ?? null]);

        if ($pinjam->user_id) {
            NotificationCustom::create([
                'user_id' => $pinjam->user_id,
                'type' => 'peminjaman_lab_reject_return',
                'data' => [
                    'message' => 'Permintaan pengembalian laboratorium Anda ditolak.',
                    'alasan' => $validated['alasan'] ?? null,
                    'peminjaman_id' => $pinjam->id,
                ],
                'is_read' => false,
            ]);
        }

        return redirect()->back()->with('success', 'Pengembalian ditolak.');
    }
}
