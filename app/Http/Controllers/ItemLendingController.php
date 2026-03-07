<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Barang;
use App\Models\PeminjamanBarang;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use App\Models\Petugas;
use App\Models\Administrator;
use App\Models\NotificationCustom;

class ItemLendingController extends Controller
{
    public function dashboard(Request $request)
    {
        $year = $request->input('year', date('Y'));
        $user = Auth::user();

        // Inisialisasi variabel untuk Mahasiswa
        $barangDipinjam = 0;
        $menungguPersetujuan = 0;
        $jatuhTempoKembali = '-';

        // 1. Logika Khusus Mahasiswa
        if ($user && $user->role === 'mahasiswa') {
            // A. Barang sedang dipinjam (Status: dipinjam)
            $barangDipinjam = PeminjamanBarang::where('user_id', $user->id)
                ->where('status', 'dipinjam')
                ->count();

            // B. Menunggu Persetujuan (Status: booked dan proses_kembali)
            $menungguPersetujuan = PeminjamanBarang::where('user_id', $user->id)
                ->whereIn('status', ['booked', 'proses_kembali'])
                ->count();

            // C. Jatuh Tempo Pengembalian Terdekat
            $peminjamanTerdekat = PeminjamanBarang::where('user_id', $user->id)
                ->where('status', 'dipinjam')
                ->whereDate('tanggal_kembali', '>=', today())
                ->orderBy('tanggal_kembali', 'asc')
                ->first();

            $jatuhTempoKembali = $peminjamanTerdekat
                ? \Carbon\Carbon::parse($peminjamanTerdekat->tanggal_kembali)->translatedFormat('d M Y')
                : 'Tidak ada jadwal';
        }

        // 2. Data Chart (Dinamis: Jika mahasiswa, hanya data dia sendiri)
        // 2. Data Chart
        $chartQuery = PeminjamanBarang::select(
            DB::raw('MONTH(created_at) as month'),
            DB::raw('count(*) as total')
        )
            ->whereYear('created_at', $year)
            ->groupBy('month')
            ->orderBy('month');

        // PERBAIKAN: Gunakan logika "Kecuali Admin/Petugas" 
        // atau tambahkan role 'user' ke dalam pengecekan.
        $adminRoles = ['admin', 'administrator', 'petugas'];

        if (!in_array($user->role, $adminRoles)) {
            // Jika BUKAN admin/petugas, kunci data hanya milik sendiri
            $chartQuery->where('user_id', $user->id);
        }

        $chartDataRaw = $chartQuery->get();

        $chartDataRaw = $chartQuery->get();
        $chartData = array_fill(0, 12, 0);
        foreach ($chartDataRaw as $data) {
            $chartData[$data->month - 1] = $data->total;
        }

        // 3. Statistik Global (Tetap dikirim untuk Admin)
        $stats = [
            'totalAdministrator' => User::whereIn('role', ['admin', 'administrator'])->count(),
            'totalMahasiswa'     => User::where('role', 'mahasiswa')->count(),
            'totalBarang'        => Barang::count(),

            // Data Tambahan untuk Frontend Mahasiswa
            'barangDipinjam'      => $barangDipinjam,
            'menungguPersetujuan' => $menungguPersetujuan,
            'jatuhTempoKembali'   => $jatuhTempoKembali,
        ];

        return Inertia::render('Services/ItemLending/Dashboard', [
            'auth' => [
                'user' => $user
            ],
            'stats'              => $stats,
            'chartData'          => $chartData,
            'year'               => (int)$year,
            'latestMahasiswa'    => User::where('role', 'mahasiswa')->latest()->first(),
            'firstAdministrator' => User::whereIn('role', ['admin', 'administrator'])->first(),
        ]);
    }

    public function items(Request $request)
    {
        // 1. Ambil input filter
        $filters = $request->only(['search', 'kategori', 'status', 'tanggal_masuk']);

        // 2. Query (Simpan dalam builder, jangan panggil ->get() dulu)
        $query = Barang::query()
            // Filter Pencarian
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('idbarang', 'like', "%{$search}%")
                        ->orWhere('namabarang', 'like', "%{$search}%");
                });
            })
            // Filter Kategori
            ->when($request->kategori, fn($q, $kat) => $q->where('kategori', $kat))
            // Filter Status
            ->when($request->status, fn($q, $stat) => $q->where('status', $stat))
            // Filter Tanggal
            ->when($request->tanggal_masuk, fn($q, $tgl) => $q->whereDate('tanggal_masuk', $tgl))

            // Sorting
            ->latest('updated_at');

        // 3. Eksekusi Pagination langsung dari builder
        // withQueryString() sangat penting agar saat pindah halaman, filter tetap terbawa di URL
        $barangs = $query->paginate(10)->withQueryString();

        return Inertia::render('Services/ItemLending/Items', [
            'barangs' => $barangs,
            'filters' => $filters
        ]);
    }
    public function storeItem(Request $request)
    {
        Log::info('ItemLendingController@storeItem called', ['input' => $request->all()]);

        $validated = $request->validate([
            'namabarang'    => 'required|string|max:255',
            'kategori'      => 'required|string|max:100',
            'tanggal_masuk' => 'required|date',
            'status'        => 'required|string',
            'hargabarang'   => 'required|numeric',
            'stok'          => 'required|integer|min:0',
        ]);

        $lastRecord = Barang::withTrashed() // Gunakan withTrashed jika kamu pakai SoftDeletes
            ->orderBy('idbarang', 'desc')
            ->first();

        if ($lastRecord) {
            $lastNumber = (int) substr($lastRecord->idbarang, 3);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        $newId = 'brg' . str_pad($newNumber, 3, '0', STR_PAD_LEFT);

        while (Barang::withTrashed()->where('idbarang', $newId)->exists()) {
            $newNumber++;
            $newId = 'brg' . str_pad($newNumber, 3, '0', STR_PAD_LEFT);
        }

        $validated['idbarang'] = $newId;

        Barang::create($validated);

        return redirect()->back()->with('success', "Barang berhasil ditambahkan dengan ID $newId!");
    }

    public function updateItem(Request $request, $id)
    {
        $barang = Barang::findOrFail($id);

        // 1. Jalankan validasi dan simpan hasilnya di variabel $validated
        $validated = $request->validate([
            'namabarang' => 'required|string|max:255',
            'kategori' => 'required|string|max:100',
            'tanggal_masuk' => 'required|date',
            'status' => 'required|string',
            'hargabarang' => 'required|numeric',
            'stok' => 'required|integer|min:0', // Ini adalah ATURAN
        ]);
        $barang->update($validated);
        return redirect()->back()->with('success', "Barang {$barang->idbarang} berhasil diperbarui!");
    }

    public function deleteSelected(Request $request)
    {
        $selectedIds = $request->input('selected_ids', []);

        if (empty($selectedIds)) {
            return redirect()->back()->with('error', 'Tidak ada barang yang dipilih.');
        }

        // Ambil barang yang statusnya boleh "dihapus"
        $items = Barang::whereIn('idbarang', $selectedIds)
            ->whereIn('status', ['available', 'rusak'])
            ->get();

        if ($items->isEmpty()) {
            return redirect()->back()->with('error', 'Barang yang sedang dipinjam/booked tidak bisa dihapus.');
        }

        $deletedCount = $items->count();

        // Ini sekarang akan melakukan Soft Delete secara otomatis
        Barang::whereIn('idbarang', $items->pluck('idbarang'))->delete();

        return redirect()->back()->with('success', "$deletedCount barang berhasil dipindahkan ke tempat sampah (Soft Delete).");
    }
    public function list(Request $request)
    {
        $filters = $request->only(['search', 'status']);

        $peminjamans = PeminjamanBarang::with(['user', 'barang', 'petugas', 'admin'])
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('nama_peminjam', 'like', "%{$search}%")
                        ->orWhereHas('barang', function ($qb) use ($search) {
                            $qb->where('namabarang', 'like', "%{$search}%");
                        });
                });
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Services/ItemLending/LendingList', [
            'peminjamans' => $peminjamans,
            'filters' => $filters
        ]);
    }

    public function history(Request $request)
    {
        $query = PeminjamanBarang::with(['barang', 'user', 'petugas', 'admin'])
            ->whereIn('status', ['dikembalikan', 'ditolak', 'terlambat']);

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
                    ->orWhereHas('barang', function ($qb) use ($request) {
                        $qb->where('namabarang', 'like', '%' . $request->search . '%');
                    })
                    ->orWhereHas('user', function ($qu) use ($request) {
                        $qu->where('name', 'like', '%' . $request->search . '%');
                    });
            });
        }

        // Ganti get() dengan paginate() dan tambahkan withQueryString()
        $peminjamans = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Services/ItemLending/History', [
            'peminjamans' => $peminjamans,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function lendNow()
    {
        // 1. Ambil data peminjaman milik user yang sedang login
        $peminjamans = PeminjamanBarang::with(['user', 'barang', 'petugas', 'admin'])
            ->where('user_id', Auth::id())
            ->whereIn('status', ['booked', 'dipinjam', 'proses_kembali'])
            ->latest()
            ->get()
            ->map(function ($p) {
                $tglPinjam = \Carbon\Carbon::parse($p->tanggal_pinjam);
                $tglKembali = $p->tanggal_kembali ? \Carbon\Carbon::parse($p->tanggal_kembali) : now();

                $p->durasi_hari = $tglPinjam->diffInDays($tglKembali);

                if ($p->status === 'dipinjam' && $p->tanggal_kembali && now()->gt(Carbon::parse($p->tanggal_kembali)->endOfDay())) {
                    $p->status = 'terlambat';
                }
                return $p;
            });

        // 2. Ambil barang yang tersedia dari database
        // Ambil barang dengan status 'available' dan stok lebih dari 0
        $barangTersedia = Barang::query()
            ->where('status', 'available')
            ->where('stok', '>', 0)
            ->select('idbarang', 'namabarang', 'stok', 'status')
            ->orderBy('namabarang')
            ->get()
            ->toArray();

        // Debugging di sisi Server (Opsional: Aktifkan ini jika ingin cek di layar putih)
        // dd($barangTersedia); 

        // Total transaksi (semua peminjaman milik user, tidak hanya yang aktif)
        $totalTransactions = PeminjamanBarang::where('user_id', Auth::id())->count();

        return Inertia::render('Services/ItemLending/LendNow', [
            'peminjamans'      => $peminjamans,
            'barangTersedia'   => $barangTersedia, // Pastikan key ini sama dengan di LendNow.tsx
            'totalTransactions' => $totalTransactions,
        ]);
    }

    public function storeLending(Request $request)
    {
        Log::info('ItemLendingController@storeLending called', ['input' => $request->all()]);
        $validated = $request->validate([
            'barang_id'     => 'required|exists:barangs,idbarang', // Ganti 'id' jadi 'idbarang'
            'nama_peminjam' => 'required|string|max:255',
            'jumlah'        => 'nullable|integer|min:1',
            'tanggal_pinjam'  => 'required|date',
            'tanggal_kembali' => 'required|date|after_or_equal:tanggal_pinjam',
            'catatan'       => 'nullable|string',
        ]);

        DB::transaction(function () use ($validated) {
            // 1. Simpan ke tabel peminjaman_barang sebagai 'booked' (pemesanan)
            $barang = Barang::findOrFail($validated['barang_id']);

            PeminjamanBarang::create([
                'user_id'         => Auth::id(),
                'barang_id'       => $validated['barang_id'],
                'namabarang'      => $barang->namabarang,
                'id_transaksi'    => uniqid('txn_'),
                'nama_peminjam'   => $validated['nama_peminjam'],
                'jumlah'          => isset($validated['jumlah']) ? (int)$validated['jumlah'] : 1,
                'tanggal_pinjam'  => $validated['tanggal_pinjam'],
                'tanggal_kembali' => $validated['tanggal_kembali'],
                'catatan'         => $validated['catatan'] ?? null,
                'status'          => 'booked',
            ]);

            // Note: stok dikurangi hanya ketika booking disetujui (approve)
        });

        return redirect()->back()->with('success', 'Peminjaman berhasil dicatat.');
    }

    /**
     * Mengembalikan barang yang dipilih (Bulk Action)
     */
    public function kembalikanSelected(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:peminjaman_barang,id' // Perbaikan 2
        ]);

        DB::transaction(function () use ($request) {
            // Tandai peminjaman terpilih sebagai proses_kembali (user/penyelia mengembalikan)
            $peminjamans = PeminjamanBarang::whereIn('id', $request->ids)
                ->where('status', 'dipinjam')
                ->get();

            foreach ($peminjamans as $pinjam) {
                $pinjam->update([
                    'status' => 'proses_kembali',
                ]);
            }
        });

        return redirect()->back()->with('success', count($request->ids) . ' barang telah dikembalikan.');
    }

    /**
     * Batalkan peminjaman yang berstatus 'booked'
     */
    public function cancel($id)
    {
        $pinjam = PeminjamanBarang::findOrFail($id);

        if ($pinjam->status !== 'booked') {
            return redirect()->back()->with('error', 'Hanya peminjaman dengan status booked yang bisa dibatalkan.');
        }

        $pinjam->update([
            'status' => 'dikembalikan'
        ]);

        return redirect()->back()->with('success', 'Peminjaman berhasil dibatalkan.');
    }

    /**
     * Approve a booking (set to dipinjam, decrement stok and set petugas)
     */
    public function approve($id)
    {
        if (!Auth::check() || !in_array(Auth::user()->role, ['admin', 'petugas'])) {
            return redirect()->back()->with('error', 'Anda tidak memiliki izin.');
        }

        $pinjam = PeminjamanBarang::findOrFail($id);

        if ($pinjam->status !== 'booked') {
            return redirect()->back()->with('error', 'Hanya booking yang dapat disetujui.');
        }

        $user = Auth::user();

        DB::transaction(function () use ($pinjam, $user) {

            $update = [
                'status' => 'dipinjam',
            ];

            // SIMPAN USER ID (BUKAN administrator.id)
            if ($user->role === 'petugas') {
                $update['petugas_id'] = $user->id;
            } else {
                $update['admin_id'] = $user->id;
            }

            $pinjam->update($update);

            $qty = (int) ($pinjam->jumlah ?? 1);

            $barang = Barang::where('idbarang', $pinjam->barang_id)->first();

            if ($barang) {
                $barang->decrement('stok', $qty);

                if ((int) $barang->stok <= 0) {
                    $barang->update(['status' => Barang::STATUS_UNAVAILABLE]);
                }
            }
        });

        return redirect()->back()->with('success', 'Booking berhasil disetujui.');
    }

    /**
     * Finalize return for a single peminjaman (set tanggal_kembali_sebenarnya, increment stok, set status dikembalikan/terlambat)
     */
    public function finalizeReturn($id)
    {
        $pinjam = PeminjamanBarang::findOrFail($id);

        if (!in_array($pinjam->status, ['dipinjam', 'proses_kembali'])) {
            return redirect()->back()->with('error', 'Peminjaman tidak dalam status yang bisa dikembalikan.');
        }

        DB::transaction(function () use ($pinjam) {
            $pinjam->update([
                'tanggal_kembali_sebenarnya' => now(),
            ]);

            // Tentukan status akhir
            $isLate = now()->gt(
                Carbon::parse($pinjam->tanggal_kembali)
            );

            $finalStatus = $isLate ? 'terlambat' : 'dikembalikan';
            $pinjam->update(['status' => $finalStatus]);

            $qty = isset($pinjam->jumlah) && is_numeric($pinjam->jumlah) ? (int)$pinjam->jumlah : 1;
            $barang = Barang::where('idbarang', $pinjam->barang_id)->first();
            if ($barang) {
                $barang->increment('stok', $qty);
                $barang->refresh();
                if ((int) $barang->stok > 0) {
                    $barang->update(['status' => Barang::STATUS_AVAILABLE]);
                }
            }
        });

        return redirect()->back()->with('success', 'Pengembalian berhasil diproses.');
    }

    /**
     * Approve a return request (admin/petugas action) — mirrors finalizeReturn
     */
    public function approveBack($id)
    {
        if (!Auth::check() || !in_array(Auth::user()->role, ['admin', 'petugas'])) {
            return redirect()->back()->with('error', 'Anda tidak memiliki izin untuk mengonfirmasi pengembalian.');
        }

        $pinjam = PeminjamanBarang::findOrFail($id);

        if ($pinjam->status !== 'proses_kembali') {
            return redirect()->back()->with('error', 'Hanya peminjaman dengan status proses_kembali yang dapat dikonfirmasi.');
        }

        $user = Auth::user();

        DB::transaction(function () use ($pinjam, $user) {

            $update = [
                'tanggal_kembali_sebenarnya' => now()
            ];

            // FIX FK SOURCE
            if ($user->role === 'petugas') {
                $update['petugas_id'] = $user->id;
            } else {
                $update['admin_id'] = $user->id;
            }
            $pinjam->update($update);

            // Status logic
            $isLate = now()->gt(Carbon::parse($pinjam->tanggal_kembali));
            $pinjam->update([
                'status' => $isLate ? 'terlambat' : 'dikembalikan'
            ]);

            // Stock return
            $qty = (int) ($pinjam->jumlah ?? 1);

            // FIX query barang
            $barang = Barang::find($pinjam->barang_id);

            if ($barang) {
                $barang->increment('stok', $qty);

                if ($barang->stok > 0) {
                    $barang->update([
                        'status' => Barang::STATUS_AVAILABLE
                    ]);
                }
            }
        });

        return redirect()->back()->with('success', 'Konfirmasi pengembalian berhasil.');
    }


    /**
     * Reject a return request (admin/petugas action) — revert to dipinjam
     */
    public function rejectBack(Request $request, $id)
    {
        // Only admin or petugas can reject return confirmations
        if (!Auth::user() || !in_array(Auth::user()->role, ['admin', 'petugas'])) {
            return redirect()->back()->with('error', 'Anda tidak memiliki izin untuk menolak pengembalian.');
        }

        $pinjam = PeminjamanBarang::findOrFail($id);

        if ($pinjam->status !== 'proses_kembali') {
            return redirect()->back()->with('error', 'Hanya peminjaman dengan status proses_kembali yang dapat ditolak.');
        }

        $validated = $request->validate([
            'alasan' => 'nullable|string|max:2000'
        ]);

        $pinjam->update([
            'status' => 'dipinjam',
            'tanggal_kembali_sebenarnya' => null,
            'alasan' => $validated['alasan'] ?? null,
        ]);

        if ($pinjam->user_id) {
            NotificationCustom::create([
                'user_id' => $pinjam->user_id,
                'type' => 'peminjaman_barang_reject_return',
                'data' => [
                    'message' => 'Permintaan pengembalian barang Anda ditolak.',
                    'alasan' => $validated['alasan'] ?? null,
                    'peminjaman_id' => $pinjam->id,
                ],
                'is_read' => false,
            ]);
        }

        return redirect()->back()->with('success', 'Permintaan pengembalian ditolak, status kembali menjadi dipinjam.');
    }
}
