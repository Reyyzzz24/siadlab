<?php

namespace App\Http\Controllers;

use App\Models\SuratMasuk;
use App\Models\SuratKeluar;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class MailArchiveController extends Controller
{
    public function dashboard(Request $request)
    {
        $year = $request->input('year', date('Y'));
        $user = Auth::user();

        // 1. Tentukan roleLabel (Sesuai kebutuhan di LendingSidebar)
        $roleLabel = 'Administrator';
        if ($user->role === 'petugas') {
            $roleLabel = 'Petugas';
        } elseif ($user->role === 'user') {
            $roleLabel = 'Pengguna Layanan';
        }

        // 2. Statistik (Mengikuti struktur array stats)
        $stats = [
            'totalAdministrator' => User::whereIn('role', ['admin', 'administrator'])->count(),
            'totalSuratMasuk'    => SuratMasuk::count(),
            'totalSuratKeluar'   => SuratKeluar::count(),
        ];

        // 3. Data Chart (Gabungan Surat Masuk & Keluar)
        // Query Surat Masuk
        $masukRaw = SuratMasuk::select(
            DB::raw('MONTH(tanggal_terima) as month'),
            DB::raw('count(*) as total')
        )
            ->whereYear('tanggal_terima', $year)
            ->groupBy('month')
            ->get();

        // Query Surat Keluar
        $keluarRaw = SuratKeluar::select(
            DB::raw('MONTH(tanggal_surat) as month'),
            DB::raw('count(*) as total')
        )
            ->whereYear('tanggal_surat', $year)
            ->groupBy('month')
            ->get();

        // Mapping ke array 12 bulan (Struktur chart data)
        $chartData = [
            'masuk' => array_fill(0, 12, 0),
            'keluar' => array_fill(0, 12, 0),
        ];

        foreach ($masukRaw as $data) {
            $chartData['masuk'][$data->month - 1] = $data->total;
        }
        foreach ($keluarRaw as $data) {
            $chartData['keluar'][$data->month - 1] = $data->total;
        }

        // 4. Data Pendukung Sidebar
        $suratTerbaru = SuratMasuk::latest()->first();
        $firstAdmin = User::whereIn('role', ['admin', 'administrator'])->first();

        return Inertia::render('Services/MailArchive/Dashboard', [
            'roleLabel'          => $roleLabel,
            'stats'              => $stats,
            'chart'              => [
                'year'       => (int)$year,
                'dataMasuk'  => $chartData['masuk'],
                'dataKeluar' => $chartData['keluar'],
            ],
            'suratTerbaru'       => $suratTerbaru,
            'firstAdministrator' => $firstAdmin,
        ]);
    }

    public function incoming(Request $request)
    {
        $query = SuratMasuk::with('penerima');

        // Search Logic
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('no_surat', 'like', '%' . $request->search . '%')
                    ->orWhere('asal_surat', 'like', '%' . $request->search . '%')
                    ->orWhere('perihal', 'like', '%' . $request->search . '%')
                    ->orWhere('no_agenda', 'like', '%' . $request->search . '%');
            });
        }

        // Filter Tanggal
        if ($request->tanggal_terima) {
            $query->whereDate('tanggal_terima', $request->tanggal_terima);
        }

        // Generate Nomor Agenda Berikutnya
        $lastRecord = SuratMasuk::latest('id')->first();
        $nextNumber = $lastRecord ? ($lastRecord->id + 1) : 1;
        $nextAgenda = str_pad($nextNumber, 3, '0', STR_PAD_LEFT);

        // Tambahkan Pagination di sini
        // Saya set 10 data per halaman, silakan sesuaikan angkanya
        $suratMasuk = $query->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Services/MailArchive/IncomingMail', [
            'suratMasuk'       => $suratMasuk,
            'filters'          => $request->only(['search', 'tanggal_terima']),
            'nextAgendaNumber' => $nextAgenda,
        ]);
    }

    public function storeIncome(Request $request)
    {
        $validated = $request->validate([
            'no_agenda' => 'required', // Tambahkan validasi no_agenda karena sekarang dikirim dari form
            'no_surat' => 'required|unique:surat_masuk,no_surat',
            'asal_surat' => 'required',
            'tanggal_surat' => 'required|date',
            'tanggal_terima' => 'required|date',
            'perihal' => 'required',
            'file' => 'nullable|mimes:pdf,jpg,png,doc,docx|max:2048'
        ]);

        $validated['penerima_id'] = Auth::id();

        if ($request->hasFile('file')) {
            $file = $request->file('file');

            // Mendapatkan nama asli file
            $originalName = $file->getClientOriginalName();

            // Menghindari duplikasi nama dengan menambahkan timestamp (opsional tapi disarankan)
            $fileName = time() . '_' . $originalName;

            // Gunakan storeAs: parameter 1 adalah folder, parameter 2 adalah nama file
            $path = $file->storeAs('arsipsurat/masuk', $fileName, 'google');

            $validated['file_surat'] = $path;
        }

        SuratMasuk::create($validated);
        return back()->with('success', 'Surat masuk berhasil ditambahkan.');
    }
    public function updateIncome(Request $request, $id)
    {
        $surat = SuratMasuk::findOrFail($id);

        $validated = $request->validate([
            'no_agenda' => 'required',
            'no_surat' => 'required|unique:surat_masuk,no_surat,' . $id,
            'asal_surat' => 'required',
            'tanggal_surat' => 'required|date',
            'tanggal_terima' => 'required|date',
            'perihal' => 'required',
            'file' => 'nullable|mimes:pdf,jpg,png,doc,docx|max:2048'
        ]);

        if ($request->hasFile('file')) {
            // Hapus file lama jika ada
            if ($surat->file_surat) {
                Storage::disk('google')->delete($surat->file_surat);
            }

            $file = $request->file('file');
            $fileName = time() . '_' . $file->getClientOriginalName();

            // Simpan dengan nama asli
            $path = $file->storeAs('arsipsurat/masuk', $fileName, 'google');
            $validated['file_surat'] = $path;
        }

        $surat->update($validated);
        return back()->with('success', 'Surat masuk berhasil diperbarui.');
    }
    public function deleteSelectedIncome(Request $request)
    {
        $ids = $request->ids;
        if (!$ids || !is_array($ids)) {
            return back()->with('error', 'Tidak ada data yang dipilih.');
        }

        $items = SuratMasuk::whereIn('id', $ids)->get();

        foreach ($items as $item) {
            if ($item->file_surat) {
                try {
                    // Pastikan menggunakan disk 'google'
                    if (Storage::disk('google')->exists($item->file_surat)) {
                        Storage::disk('google')->delete($item->file_surat);
                    }
                } catch (\Exception $e) {
                    // Sekarang 'Log' sudah terdefinisi
                    Log::error("Gagal menghapus file di Google Drive: " . $e->getMessage());
                }
            }
            $item->delete();
        }

        return back()->with('success', count($items) . ' surat masuk berhasil dihapus.');
    }

    // Surat Keluar (Outgoing)
    public function outgoing(Request $request)
    {
        $query = SuratKeluar::with('pengirim');

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('no_surat', 'like', '%' . $request->search . '%')
                    ->orWhere('tujuan_surat', 'like', '%' . $request->search . '%')
                    ->orWhere('perihal', 'like', '%' . $request->search . '%')
                    ->orWhere('no_agenda', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->tanggal_surat) {
            $query->whereDate('tanggal_surat', $request->tanggal_surat);
        }

        $lastRecord = SuratKeluar::latest('id')->first();
        $nextNumber = $lastRecord ? ($lastRecord->id + 1) : 1;
        $nextAgenda = str_pad($nextNumber, 3, '0', STR_PAD_LEFT);

        // Ganti ->get() dengan ->paginate()
        $suratKeluar = $query->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Services/MailArchive/OutgoingMail', [
            'suratKeluar'      => $suratKeluar,
            'filters'          => $request->only(['search', 'tanggal_surat']),
            'nextAgendaNumber' => $nextAgenda,
        ]);
    }

    public function storeOutgoing(Request $request)
    {
        $validated = $request->validate([
            'no_agenda' => 'required',
            'no_surat' => 'required|unique:surat_keluar,no_surat',
            'tanggal_surat' => 'required|date',
            'tujuan_surat' => 'required',
            'perihal' => 'required',
            'file' => 'nullable|mimes:pdf,jpg,png,doc,docx|max:2048'
        ]);

        $validated['pengirim_id'] = Auth::id();

        if ($request->hasFile('file')) {
            $file = $request->file('file');

            // Mendapatkan nama asli file
            $originalName = $file->getClientOriginalName();

            // Menghindari duplikasi nama dengan menambahkan timestamp (opsional tapi disarankan)
            $fileName = time() . '_' . $originalName;

            // Gunakan storeAs: parameter 1 adalah folder, parameter 2 adalah nama file
            $path = $file->storeAs('arsipsurat/keluar', $fileName, 'google');

            $validated['file_surat'] = $path;
        }

        SuratKeluar::create($validated);
        return back()->with('success', 'Surat keluar berhasil ditambahkan.');
    }

    public function updateOutgoing(Request $request, $id)
    {
        $surat = SuratKeluar::findOrFail($id);

        $validated = $request->validate([
            'no_agenda' => 'required',
            'no_surat' => 'required|unique:surat_keluar,no_surat,' . $id,
            'tanggal_surat' => 'required|date',
            'tujuan_surat' => 'required',
            'perihal' => 'required',
            'file' => 'nullable|mimes:pdf,jpg,png,doc,docx|max:2048'
        ]);

        if ($request->hasFile('file')) {
            // Hapus file lama jika ada
            if ($surat->file_surat) {
                Storage::disk('google')->delete($surat->file_surat);
            }

            $file = $request->file('file');
            $fileName = time() . '_' . $file->getClientOriginalName();

            // Simpan dengan nama asli
            $path = $file->storeAs('arsipsurat/keluar', $fileName, 'google');
            $validated['file_surat'] = $path;
        }

        $surat->update($validated);
        return back()->with('success', 'Surat keluar berhasil diperbarui.');
    }

    public function deleteSelectedOutgoing(Request $request)
    {
        $ids = $request->ids;

        // Validasi jika tidak ada ID yang dipilih
        if (!$ids || !is_array($ids)) {
            return back()->with('error', 'Tidak ada data surat keluar yang dipilih.');
        }

        $items = SuratKeluar::whereIn('id', $ids)->get();

        foreach ($items as $item) {
            if ($item->file_surat) {
                try {
                    // Gunakan disk 'google' untuk menghapus file di Drive Akun B
                    if (Storage::disk('google')->exists($item->file_surat)) {
                        Storage::disk('google')->delete($item->file_surat);
                    }
                } catch (\Exception $e) {
                    // Mencatat error ke log jika gagal hapus di cloud (misal: masalah izin)
                    Log::error("Gagal menghapus file surat keluar di Google Drive: " . $e->getMessage());
                }
            }
            // Hapus data dari database tetap dilakukan meskipun file cloud gagal dihapus
            $item->delete();
        }

        return back()->with('success', count($items) . ' surat keluar berhasil dihapus.');
    }

    public function downloadFile($id, $type)
    {
        $model = ($type === 'incoming')
            ? SuratMasuk::findOrFail($id)
            : SuratKeluar::findOrFail($id);

        if (!$model->file_surat) {
            return back()->with('error', 'Data file tidak ditemukan di database.');
        }

        try {
            /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
            $disk = Storage::disk('google');

            if (!$disk->exists($model->file_surat)) {
                return back()->with('error', 'File fisik tidak ditemukan di Google Drive.');
            }

            // Sekarang Intelephense akan mengenali method get, mimeType, dll.
            $fileContent = $disk->get($model->file_surat);
            $mimeType = $disk->mimeType($model->file_surat);
            $fileName = basename($model->file_surat);

            return response($fileContent, 200, [
                'Content-Type' => $mimeType,
                'Content-Disposition' => 'inline; filename="' . $fileName . '"',
            ]);
        } catch (\Exception $e) {
            Log::error("Download Error: " . $e->getMessage());
            return back()->with('error', 'Gagal mengambil file: ' . $e->getMessage());
        }
    }
}
