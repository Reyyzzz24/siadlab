<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Pembayaran; // Menggunakan model Pembayaran
use Illuminate\Http\Request;
use App\Models\Tagihan;      // FIX: Tambahkan ini
use App\Models\Mahasiswa;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\SPP;
use Carbon\Carbon;
use App\Models\NotificationCustom;

class PaymentController extends Controller
{
    public function dashboard(Request $request)
    {
        $tahunDipilih = $request->query('year', date('Y'));
        $user = Auth::user();

        // Inisialisasi variabel untuk Mahasiswa
        $totalTagihanAktif = 0;
        $totalSudahDibayar = 0;
        $jatuhTempoTerdekat = '-';

        // 1. Logika Khusus Mahasiswa
        if ($user && $user->role === 'mahasiswa') {
            $mahasiswa = Mahasiswa::where('user_id', $user->id)->first();

            if ($mahasiswa) {
                // A. Total Tagihan Aktif (Belum Bayar)
                $totalTagihanAktif = Tagihan::where('mahasiswa_id', $mahasiswa->id)
                    ->where('status', 'belum_bayar')
                    ->sum('nominal');

                // B. Total Sudah Dibayar (Dari tabel pembayarans)
                $totalSudahDibayar = Pembayaran::where('user_id', $user->id)
                    ->where('status', 'lunas')
                    ->sum('nominal');

                // C. Jatuh Tempo Terdekat (Menampilkan yang paling lama belum dibayar)
                $tagihanTerdekat = Tagihan::where('mahasiswa_id', $mahasiswa->id)
                    ->where('status', 'belum_bayar')
                    ->orderBy('tanggal_jatuh_tempo', 'asc') // Paling lama/mendekati sekarang di atas
                    ->first();

                if ($tagihanTerdekat) {
                    $tgl = \Carbon\Carbon::parse($tagihanTerdekat->tanggal_jatuh_tempo);
                    $labelTerlambat = $tgl->isPast() ? ' (Terlambat)' : '';

                    $jatuhTempoTerdekat = $tgl->translatedFormat('d M Y') . $labelTerlambat;
                } else {
                    $jatuhTempoTerdekat = 'Tidak ada tagihan';
                }

                $jatuhTempoTerdekat = $tagihanTerdekat
                    ? \Carbon\Carbon::parse($tagihanTerdekat->tanggal_jatuh_tempo)->translatedFormat('d M Y')
                    : 'Tidak ada tagihan';
            }
        }

        // 2. Data Chart (Filter berdasarkan user jika mahasiswa)
        $chartQuery = Pembayaran::select(
            DB::raw('MONTH(created_at) as bulan'),
            DB::raw('SUM(nominal) as total')
        )
            ->whereYear('created_at', $tahunDipilih)
            ->where('status', 'lunas')
            ->groupBy('bulan');

        // Jika mahasiswa, chart hanya menampilkan history bayar dia sendiri
        if ($user->role === 'mahasiswa') {
            $chartQuery->where('user_id', $user->id);
        }

        $chartDataRaw = $chartQuery->get();
        $chartData = array_fill(0, 12, 0);
        foreach ($chartDataRaw as $data) {
            $chartData[$data->bulan - 1] = (int) $data->total;
        }

        // 3. Statistik Global (Hanya untuk Admin/Petugas)
        $totalAdministrator = User::whereIn('role', ['admin', 'petugas'])->count();
        $totalMahasiswa = User::where('role', 'mahasiswa')->count();

        return Inertia::render('Services/Payment/Dashboard', [
            'auth' => [
                'user' => $user
            ],
            'stats' => [
                // Data untuk Admin
                'totalAdministrator' => $totalAdministrator,
                'totalMahasiswa' => $totalMahasiswa,

                // Data untuk Mahasiswa (Personal)
                'totalTagihanAktif' => 'Rp ' . number_format($totalTagihanAktif, 0, ',', '.'),
                'totalSudahDibayar' => 'Rp ' . number_format($totalSudahDibayar, 0, ',', '.'),
                'jatuhTempoTerdekat' => $jatuhTempoTerdekat,

                // Info lama tetap dikirim atau disesuaikan
                'totalPembayaran' => 'Rp ' . number_format($totalTagihanAktif, 0, ',', '.'),
            ],
            'chartData' => $chartData,
            'tahunDipilih' => (int) $tahunDipilih,
            'latestMahasiswa' => User::where('role', 'mahasiswa')->latest()->first(),
            'firstAdministrator' => User::whereIn('role', ['admin', 'petugas'])->first(),
        ]);
    }

    public function list(Request $request)
    {
        $payments = Pembayaran::with('user')
            ->when($request->status, fn($q, $v) => $q->where('status', $v))
            ->when($request->kategori, fn($q, $v) => $q->where('kategori', $v))
            ->when($request->jenis_pembayaran, fn($q, $v) => $q->where('jenis_pembayaran', $v))
            ->when($request->tanggal_from, fn($q, $v) => $q->whereDate('created_at', '>=', $v))
            ->when($request->tanggal_to, fn($q, $v) => $q->whereDate('created_at', '<=', $v))
            ->when($request->search, function ($q, $v) {
                $q->where(
                    fn($sub) => $sub
                        ->whereHas('user', fn($u) => $u->where('name', 'like', "%$v%"))
                        ->orWhere('id', 'like', "%$v%")
                        ->orWhere('id_transaksi', 'like', "%$v%")
                        ->orWhere('kategori', 'like', "%$v%")
                );
            })
            ->latest()
            ->paginate(10)
            ->withQueryString() // Penting agar filter tidak hilang saat pindah halaman paginasi
            ->through(fn($p) => [
                'id' => $p->id,
                'id_transaksi' => $p->id_transaksi,
                'nama_pembayar' => $p->nama_pembayar ?? $p->user?->name ?? '-',
                'kategori' => $p->kategori,
                'alasan' => $p->alasan ?? null,
                'nominal' => (float) $p->nominal,
                'status' => $p->status,
                'tanggal_bayar' => $p->tanggal_bayar,
                'bukti_bayar' => $p->bukti_bayar,
                'jenis_pembayaran' => $p->jenis_pembayaran,
                'keterangan' => $p->keterangan,
            ]);

        return Inertia::render('Services/Payment/PaymentList', [
            'payments' => $payments,
            'filters'  => $request->only(['search', 'status', 'kategori', 'jenis_pembayaran', 'tanggal_from', 'tanggal_to'])
        ]);
    }

    public function finance()
    {
        $saldo_kas = Pembayaran::where('status', 'lunas')->sum('nominal');

        $total_menunggu_konfirmasi = Pembayaran::where('status', 'menunggu_konfirmasi')
            ->sum('nominal');

        $tagihan_lunas_count = Tagihan::where('status', 'lunas')->count();

        $tagihan_menunggak_count = Tagihan::where('status', 'belum_bayar')->count();

        $rincian_pendapatan = Pembayaran::where('status', 'lunas')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'nama_pembayar' => $item->nama_pembayar,
                    'kategori' => $item->kategori,
                    'nominal' => (int) $item->nominal,
                    'tanggal_bayar' => optional($item->tanggal_bayar)->format('d/m/Y'),
                ];
            });

        $chartData = Pembayaran::where('status', 'lunas')
            ->select('kategori', DB::raw('SUM(nominal) as total'))
            ->groupBy('kategori')
            ->get();

        return Inertia::render('Services/Payment/Finance', [
            'saldo_kas' => (int) $saldo_kas,
            'total_menunggu_konfirmasi' => (int) $total_menunggu_konfirmasi,
            'tagihan_lunas_count' => (int) $tagihan_lunas_count,
            'tagihan_menunggak_count' => (int) $tagihan_menunggak_count,
            'rincian_pendapatan' => $rincian_pendapatan,
            'chartData' => $chartData,
        ]);
    }


    public function pay()
    {
        $userId = Auth::id();

        // 1. Ambil data mahasiswa untuk menghitung tagihan aktif di tabel Tagihan
        $mahasiswa = Mahasiswa::where('user_id', $userId)->first();
        $totalNominalTagihan = 0;
        $tagihans = [];

        if ($mahasiswa) {
            // Hitung akumulasi nominal dari tabel Tagihans yang belum dibayar
            $totalNominalTagihan = Tagihan::where('mahasiswa_id', $mahasiswa->id)
                ->where('status', 'belum_bayar')
                ->sum('nominal');

            // Ambil Tagihan yang belum dibayar untuk menampilkan jenis_tagihan
            $tagihans = Tagihan::where('mahasiswa_id', $mahasiswa->id)
                ->where('status', 'belum_bayar')
                ->get()
                ->map(fn($t) => [
                    'id' => $t->id,
                    'jenis_tagihan' => is_array($t->jenis_tagihan) ? $t->jenis_tagihan : (json_decode($t->jenis_tagihan, true) ?? []),
                    'kategori' => $t->kategori ?? null,
                    'nominal' => (float) $t->nominal,
                    'tanggal_tagihan' => $t->tanggal_tagihan,
                ])
                ->toArray();
        }

        // Format Rupiah untuk tampilan Card Header di React
        $totalPembayaran = "Rp " . number_format($totalNominalTagihan, 0, ',', '.');

        // 2. Ambil Master Data SPP untuk Dropdown di Modal Tambah Tagihan
        // Ini digunakan agar frontend bisa mapping: Kategori -> Nominal
        $listSpp = Spp::where('status', 'aktif')
            ->select('id', 'kategori_pembayaran', 'nominal')
            ->get();

        // 3. Ambil Riwayat Pembayaran Aktif mahasiswa tersebut
        $pembayarans = Pembayaran::with(['user', 'admin', 'petugas'])
            ->where('user_id', $userId)
            ->whereIn('status', ['belum_bayar', 'menunggu_konfirmasi', 'ditolak'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'id_transaksi' => $p->id_transaksi,
                'nama_pembayar' => $p->nama_pembayar ?? ($p->user ? $p->user->name : '-'),
                'jenis_pembayaran' => $p->jenis_pembayaran,
                'alasan' => $p->alasan ?? null,
                'kategori' => $p->kategori,
                'jenis_tagihan' => $p->jenis_tagihan, // <--- WAJIB TAMBAHKAN INI
                'tanggal_tagihan' => $p->tanggal_tagihan,
                'tanggal_bayar' => $p->tanggal_bayar,
                'nominal' => (float) $p->nominal,
                'status' => $p->status,
                'keterangan' => $p->keterangan,
                'bukti_bayar' => $p->bukti_bayar,
                'admin' => $p->admin ? ['id' => $p->admin->id, 'name' => $p->admin->name] : null,
                'petugas' => $p->petugas ? ['id' => $p->petugas->id, 'name' => $p->petugas->name] : null,
            ]);

        return Inertia::render('Services/Payment/PayNow', [
            'pembayarans' => $pembayarans,
            'tagihans' => $tagihans,
            'totalPembayaran' => $totalPembayaran,
            'rawTotalTagihan' => $totalNominalTagihan,
            'listSpp' => $listSpp // <-- Data ini yang akan digunakan dropdown React
        ]);
    }

    public function history(Request $request)
    {
        $user = Auth::user();

        $pembayarans = Pembayaran::with(['user', 'admin', 'petugas'])
            // 1. Filter utama: HANYA yang berstatus lunas
            ->where('status', 'lunas')

            // 2. Filter berdasarkan role (User biasa hanya melihat miliknya sendiri)
            ->when($user->role !== 'admin' && $user->role !== 'petugas', function ($q) use ($user) {
                return $q->where('user_id', $user->id);
            })

            // 3. Fitur Search
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('nama_pembayar', 'like', '%' . $search . '%')
                        ->orWhere('id_transaksi', 'like', '%' . $search . '%')
                        ->orWhere('id', 'like', '%' . $search . '%')
                        ->orWhereHas('user', function ($qu) use ($search) {
                            $qu->where('name', 'like', '%' . $search . '%');
                        });
                });
            })

            // 4. Filter tambahan (Status dihapus karena sudah dikunci ke 'lunas' di atas)
            ->when($request->kategori, fn($q, $v) => $q->where('kategori', $v))
            ->when($request->jenis_pembayaran, fn($q, $v) => $q->where('jenis_pembayaran', $v))

            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Services/Payment/History', [
            'pembayarans' => $pembayarans,
            // Hapus 'status' dari filters yang dikirim ke frontend agar tidak membingungkan
            'filters' => $request->only(['kategori', 'jenis_pembayaran', 'search'])
        ]);
    }
    public function invoice(Request $request)
    {
        $tagihans = Tagihan::with('mahasiswa')
            ->when($request->status, function ($query, $status) {
                return $query->where('status', $status);
            })
            ->when($request->tahun_masuk, function ($query, $tahun) {
                return $query->whereHas('mahasiswa', function ($q) use ($tahun) {
                    $q->where('tahun_masuk', $tahun);
                });
            })
            ->when($request->search, function ($query, $search) {
                return $query->whereHas('mahasiswa', function ($q) use ($search) {
                    $q->where(function ($innerQuery) use ($search) {
                        $innerQuery->where('nama', 'like', "%{$search}%")
                            ->orWhere('nim', 'like', "%{$search}%");
                    });
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        $kategoriSpp = Spp::all();

        $tahunMasukList = Mahasiswa::select('tahun_masuk')
            ->distinct()
            ->whereNotNull('tahun_masuk')
            ->orderBy('tahun_masuk', 'desc')
            ->pluck('tahun_masuk');

        return Inertia::render('Services/Payment/Invoice', [
            'tagihans'         => $tagihans,
            'kategori_spp'     => $kategoriSpp,
            'tahun_masuk_list' => $tahunMasukList,
            'filters'          => $request->only(['status', 'tahun_masuk', 'search']),
        ]);
    }
    private function calculateNominal(array $jenisTagihan): int
    {
        $sppData = Spp::whereIn('kategori_pembayaran', $jenisTagihan)
            ->pluck('nominal', 'kategori_pembayaran')
            ->toArray();

        $totalNominal = 0;
        foreach ($jenisTagihan as $jenis) {
            $totalNominal += $sppData[$jenis] ?? 0;
        }
        return (int) $totalNominal;
    }

    public function storeMassal(Request $request)
    {
        $request->validate([
            'tahun_masuk' => 'required',
            'jenis_tagihan' => 'required|array',
            'tanggal_jatuh_tempo' => 'required|date',
        ]);

        $jenisTagihanBaru = $request->jenis_tagihan;

        // Ambil Mahasiswa
        $queryMahasiswa = Mahasiswa::query();
        if ($request->tahun_masuk !== 'all') {
            $queryMahasiswa->where('tahun_masuk', $request->tahun_masuk);
        }
        $mahasiswas = $queryMahasiswa->get();

        foreach ($mahasiswas as $mhs) {
            // 1. CARI record tagihan mahasiswa (TIDAK memfilter status)
            // Kita ambil yang paling terbaru (latest)
            $tagihan = Tagihan::where('mahasiswa_id', $mhs->id)
                ->latest()
                ->first();

            if ($tagihan) {
                // 2. AMBIL data array lama
                $jenisLama = is_array($tagihan->jenis_tagihan) ? $tagihan->jenis_tagihan : [];

                // 3. GABUNGKAN (Merge)
                $jenisGabungan = array_values(array_unique(
                    array_merge($jenisLama, $jenisTagihanBaru)
                ));

                // 4. HITUNG ULANG total nominal
                $nominalTotal = $this->calculateNominal($jenisGabungan);

                // 5. UPDATE record tersebut
                // Penting: Jika sebelumnya 'lunas', kita ubah kembali ke 'belum_bayar' 
                // karena ada tagihan tambahan yang baru dimasukkan.
                $tagihan->update([
                    'jenis_tagihan' => $jenisGabungan,
                    'nominal' => $nominalTotal,
                    'tanggal_jatuh_tempo' => $request->tanggal_jatuh_tempo,
                    'status' => 'belum_bayar', // Reset status agar mahasiswa bayar kekurangannya
                    'tanggal_bayar' => null,   // Hapus tanggal bayar lama
                ]);
            } else {
                // 6. JIKA mahasiswa benar-benar belum punya record sama sekali, BARU buat baru
                Tagihan::create([
                    'mahasiswa_id' => $mhs->id,
                    'jenis_tagihan' => $jenisTagihanBaru,
                    'nominal' => $this->calculateNominal($jenisTagihanBaru),
                    'tanggal_jatuh_tempo' => $request->tanggal_jatuh_tempo,
                    'status' => 'belum_bayar',
                    'tahun_masuk' => $mhs->tahun_masuk,
                ]);
            }
        }

        return redirect()->back()->with('success', 'Tagihan berhasil digabungkan ke record lama (termasuk yang sudah lunas).');
    }

    public function storePembayaran(Request $request)
    {
        $request->validate([
            'kategori' => 'required|string',
            'nominal' => 'required|numeric',
            'jenis_pembayaran' => 'required|in:cash,transfer',
        ]);

        Pembayaran::create([
            'user_id' => Auth::id(),
            'nama_pembayar' => Auth::user()->name,
            'kategori' => $request->kategori,
            'nominal' => $request->nominal,
            'jenis_pembayaran' => $request->jenis_pembayaran,
            'status' => 'belum_bayar',
            'tanggal_tagihan' => now(),
            'keterangan' => $request->keterangan ?? null,
        ]);
        return back()->with('success', 'Data pembayaran berhasil ditambahkan.');
    }

    /**
     * Bayar Selected: Mengubah status beberapa item menjadi menunggu konfirmasi (khusus Cash)
     */
    public function bayarSelected(Request $request)
    {
        $request->validate([
            'selected_ids' => 'required|array',
            'selected_ids.*' => 'exists:pembayarans,id'
        ]);

        DB::transaction(function () use ($request) {
            // Update semua pembayaran yang dipilih
            $pembayarans = Pembayaran::whereIn('id', $request->selected_ids)->get();

            foreach ($pembayarans as $pembayaran) {
                // Update Pembayaran status ke menunggu_konfirmasi
                $pembayaran->update([
                    'status' => 'menunggu_konfirmasi',
                    'tanggal_bayar' => now(),
                    'nama_pembayar' => $pembayaran->nama_pembayar ?? Auth::user()->name
                ]);

                // Update related Tagihan status to menunggu_konfirmasi (hanya jika belum dibayar)
                if ($pembayaran->nim) {
                    $mahasiswa = Mahasiswa::where('nim', $pembayaran->nim)->first();
                    if ($mahasiswa) {
                        $tagihanAktif = Tagihan::where('mahasiswa_id', $mahasiswa->id)
                            ->where('status', 'belum_bayar')
                            ->first();

                        if ($tagihanAktif) {
                            $tagihanAktif->update(['status' => 'menunggu_konfirmasi']);
                        }
                    }
                }
            }
        });

        return back()->with('success', 'Permintaan pembayaran berhasil dikirim. Silakan hubungi admin/kasir.');
    }

    /**
     * Transfer Upload: Menangani upload bukti bayar untuk jenis transfer
     */
    public function transferUpload(Request $request)
    {
        $request->validate([
            'bukti_bayar' => 'required|image', // max 2MB
        ]);

        if ($request->hasFile('bukti_bayar')) {
            $path = $request->file('bukti_bayar')->store('bukti_bayar', 'public');

            // Jika ada selected_ids (multiple), update semua
            if ($request->filled('selected_ids') && is_array($request->selected_ids)) {
                $ids = $request->selected_ids;
                $pembayarans = Pembayaran::whereIn('id', $ids)->get();
                foreach ($pembayarans as $pembayaran) {
                    $pembayaran->update([
                        'bukti_bayar' => $path,
                        'status' => 'menunggu_konfirmasi',
                        'tanggal_bayar' => now(),
                        'nama_pembayar' => $pembayaran->nama_pembayar ?? Auth::user()->name,
                    ]);
                }
            } elseif ($request->filled('pembayaran_id')) {
                $pembayaran = Pembayaran::findOrFail($request->pembayaran_id);
                $pembayaran->update([
                    'bukti_bayar' => $path,
                    'status' => 'menunggu_konfirmasi',
                    'tanggal_bayar' => now(),
                    'nama_pembayar' => $pembayaran->nama_pembayar ?? Auth::user()->name, // fallback jika kosong
                ]);
            }
        }

        return back()->with('success', 'Bukti bayar berhasil diunggah.');
    }


    /**
     * Global Update: Meng-handle update data dari Invoice (Admin) atau detail Pembayaran
     */
    public function updateTagihan(Request $request, $id)
    {
        $tagihan = Tagihan::findOrFail($id);
        $tagihan->update([
            'jenis_tagihan' => is_array($request->jenis_tagihan) ? json_encode($request->jenis_tagihan) : $request->jenis_tagihan,
            'nominal' => $request->nominal,
            'tanggal_jatuh_tempo' => $request->tanggal_jatuh_tempo,
            'status' => $request->status,
        ]);
        return back()->with('success', 'Tagihan berhasil diperbarui.');
    }

    /**
     * Global Destroy: Menghapus data pembayaran/tagihan
     */
    public function destroy($id)
    {
        // Coba cari di Pembayaran, jika tidak ada cari di Tagihan
        $pembayaran = Pembayaran::find($id);
        if ($pembayaran) {
            $pembayaran->delete();
        } else {
            $tagihan = Tagihan::findOrFail($id);
            $tagihan->delete();
        }

        return back()->with('success', 'Data berhasil dihapus.');
    }
    public function approve($id)
    {
        $user = Auth::user();

        if (!$user || !in_array($user->role, ['admin', 'petugas'])) {
            return redirect()->back()->with('error', 'Anda tidak memiliki izin.');
        }

        DB::transaction(function () use ($id, $user) {

            $pembayaran = Pembayaran::lockForUpdate()->findOrFail($id);

            // Cegah double approve
            if ($pembayaran->status === 'lunas') {
                abort(400, 'Pembayaran sudah diverifikasi.');
            }

            // Ambil mahasiswa berdasarkan user pemilik pembayaran
            $mahasiswa = Mahasiswa::where('user_id', $pembayaran->user_id)->first();

            if ($mahasiswa) {

                $tagihan = Tagihan::where('mahasiswa_id', $mahasiswa->id)
                    ->where('status', 'belum_bayar')
                    ->lockForUpdate()
                    ->first();

                if ($tagihan) {

                    $sisa = (float) $tagihan->nominal - (float) $pembayaran->nominal;

                    // Parse current jenis_tagihan array
                    $currentJenis = is_array($tagihan->jenis_tagihan)
                        ? $tagihan->jenis_tagihan
                        : json_decode($tagihan->jenis_tagihan, true) ?? [];

                    // Remove the paid kategori from jenis_tagihan array
                    $kategoriDibayar = strtolower($pembayaran->kategori);
                    $jenisBaru = array_filter($currentJenis, function ($j) use ($kategoriDibayar) {
                        return strtolower($j) !== $kategoriDibayar;
                    });
                    // Reindex array to keep it clean
                    $jenisBaru = array_values($jenisBaru);

                    if ($sisa <= 0) {
                        // Fully paid - set to lunas
                        $tagihan->update([
                            'nominal' => 0,
                            'status' => 'lunas',
                            'jenis_tagihan' => null,
                            'tanggal_bayar' => now()
                        ]);
                    } else {
                        // Partial payment - update nominal and remove paid jenis
                        $tagihan->update([
                            'nominal' => $sisa,
                            'jenis_tagihan' => !empty($jenisBaru) ? $jenisBaru : null
                        ]);
                    }
                }
            }

            if ($user->role === 'petugas') {
                $pembayaran->petugas_id = $user->id;
                $pembayaran->admin_id = null;
            } else {
                $pembayaran->admin_id = $user->id;
                $pembayaran->petugas_id = null;
            }

            $pembayaran->update([
                'status' => 'lunas',
                'tanggal_bayar' => now()
            ]);
        });

        return redirect()->back()->with('success', 'Pembayaran berhasil diverifikasi.');
    }

    public function reject(Request $request, $id)
    {
        // 1. Validasi Izin
        if (!Auth::user() || !in_array(Auth::user()->role, ['admin', 'petugas'])) {
            return redirect()->back()->with('error', 'Anda tidak memiliki izin untuk menolak pembayaran.');
        }

        $pembayaran = Pembayaran::findOrFail($id);
        $user = Auth::user();

        $validated = $request->validate([
            'alasan' => 'nullable|string|max:2000'
        ]);

        if ($user->role === 'petugas') {
            $pembayaran->petugas_id = $user->id;
            $pembayaran->admin_id = null;
        } else {
            $pembayaran->admin_id = $user->id;
            $pembayaran->petugas_id = null;
        }

        // Update status + alasan
        $pembayaran->status = 'ditolak';
        $pembayaran->alasan = $validated['alasan'] ?? null;
        $pembayaran->save();

        // Create notification for the owner
        if ($pembayaran->user_id) {
            NotificationCustom::create([
                'user_id' => $pembayaran->user_id,
                'type' => 'pembayaran_ditolak',
                'data' => [
                    'message' => 'Pembayaran Anda ditolak oleh petugas.',
                    'alasan' => $pembayaran->alasan,
                    'pembayaran_id' => $pembayaran->id,
                ],
                'is_read' => false,
            ]);
        }

        return redirect()->back()->with('success', 'Pembayaran berhasil ditolak.');
    }

    public function tuition(Request $request)
    {
        $spps = Spp::query()
            // Filter pencarian berdasarkan kategori
            ->when($request->search, fn($q, $v) => $q->where('kategori_pembayaran', 'like', "%$v%"))
            // Filter berdasarkan status (aktif/tidak_aktif)
            ->when($request->status, fn($q, $v) => $q->where('status', $v))
            ->orderBy('id', 'asc')
            ->get();

        return Inertia::render('Services/Payment/Tuition', [
            'spps' => $spps,
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    public function tuitionStore(Request $request)
    {
        $validated = $request->validate([
            'kategori_pembayaran' => 'required|string|max:255',
            'nominal' => 'required|numeric|min:0',
            'status' => 'required|in:aktif,tidak_aktif',
        ]);

        Spp::create($validated);

        return redirect()->back()->with('success', 'Master SPP berhasil ditambahkan.');
    }

    public function tuitionUpdate(Request $request, $id)
    {
        $spp = Spp::findOrFail($id);

        $validated = $request->validate([
            'kategori_pembayaran' => 'required|string|max:255',
            'nominal' => 'required|numeric|min:0',
            'status' => 'required|in:aktif,tidak_aktif',
        ]);

        $spp->update($validated);

        return redirect()->back()->with('success', 'Master SPP berhasil diperbarui.');
    }

    public function tuitionDeleteSelected(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:spps,id',
        ]);

        Spp::whereIn('id', $request->ids)->delete();

        return redirect()->back()->with('success', 'Data yang dipilih berhasil dihapus.');
    }
    /**
     * Membatalkan pembayaran oleh user jika status masih belum_bayar
     */
    public function cancel($id)
    {
        $user = Auth::user();
        $pembayaran = Pembayaran::findOrFail($id);

        // Hanya user yang membuat pembayaran atau admin/petugas yang bisa membatalkan
        if ($user->id !== $pembayaran->user_id && !in_array($user->role, ['admin', 'petugas'])) {
            return redirect()->back()->with('error', 'Anda tidak memiliki izin membatalkan pembayaran ini.');
        }

        if ($pembayaran->status !== 'belum_bayar') {
            return redirect()->back()->with('error', 'Pembayaran tidak dapat dibatalkan.');
        }

        $pembayaran->status = 'dibatalkan';
        $pembayaran->save();

        return redirect()->back()->with('success', 'Pembayaran berhasil dibatalkan.');
    }
}
