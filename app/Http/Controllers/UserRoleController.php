<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Mahasiswa;
use App\Models\Petugas;
use App\Models\Administrator;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\UsersExport;
use App\Imports\UsersImport;

class UserRoleController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        $query = User::query()->select('id', 'name', 'email', 'role');
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Paginate results so front-end receives `data`, `links` and `meta`
        $users = $query->orderBy('name')->paginate(10)->withQueryString();

        return Inertia::render('Role/Users', [
            'users' => $users,
            'filters' => $request->only('search'),
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'role' => 'required|in:admin,petugas,mahasiswa,user',
            // Password dibuat opsional (nullable) agar tidak wajib diisi setiap kali edit role
            'password' => ['nullable', 'confirmed', Password::defaults()],
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->role = $validated['role'];

        // LOGIKA PASSWORD: Hanya update jika input password diisi
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return redirect()->back()->with('success', 'User berhasil diperbarui.');
    }
    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:users,id'
        ]);

        // Menggunakan Facade Auth untuk mendapatkan ID user yang sedang login
        $currentUserId = Auth::id();

        $ids = array_filter($request->ids, fn($id) => $id != $currentUserId);

        User::whereIn('id', $ids)->delete();

        return back()->with('success', 'Pengguna terpilih berhasil dihapus.');
    }

    public function export(Request $request)
    {
        $format = $request->query('format', 'csv');

        // Jika pilih XLSX atau XLS
        if (in_array($format, ['xlsx', 'xls'])) {
            if (!class_exists('Maatwebsite\\Excel\\Facades\\Excel') || !class_exists('App\\Exports\\UsersExport')) {
                return back()->with('error', 'Excel export tidak tersedia. Pastikan paket maatwebsite/excel terpasang dan export class dibuat.');
            }

            $fileName = 'users_' . now()->format('Ymd_His') . '.' . ($format === 'xls' ? 'xls' : 'xlsx');
            return \Maatwebsite\Excel\Facades\Excel::download(new \App\Exports\UsersExport(), $fileName);
        }

        // Jika pilih CSV (Manual Stream agar ringan)
        $fileName = 'users_' . now()->format('Ymd_His') . '.csv';

        return response()->streamDownload(function () {
            $handle = fopen('php://output', 'w');
            // Tambahkan BOM agar Excel bisa baca format UTF-8 dengan benar
            fprintf($handle, chr(0xEF) . chr(0xBB) . chr(0xBF));

            fputcsv($handle, ['ID', 'Nama', 'Email', 'Role']);

            User::orderBy('name')->chunk(200, function ($users) use ($handle) {
                foreach ($users as $u) {
                    fputcsv($handle, [$u->id, $u->name, $u->email, $u->role]);
                }
            });
            fclose($handle);
        }, $fileName, [
            'Content-Type' => 'text/csv',
        ]);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt,xls,xlsx',
        ]);

        $file = $request->file('file');

        // 1. Coba gunakan Maatwebsite Excel jika tersedia
        if (class_exists('Maatwebsite\\Excel\\Facades\\Excel') && class_exists('App\\Imports\\UsersImport')) {
            try {
                // Gunakan satu backslash di depan Throwable
                Excel::import(new UsersImport(), $file);
                return back()->with('success', 'Data berhasil diimport.');
            } catch (\Throwable $e) { // PERBAIKAN: Gunakan \Throwable bukan \\Throwable
                return back()->with('error', 'Gagal import (Excel): ' . $e->getMessage());
            }
        }

        // 2. Fallback Manual untuk CSV
        $ext = strtolower($file->getClientOriginalExtension() ?? '');
        if (in_array($ext, ['csv', 'txt'])) {
            $path = $file->getRealPath();
            $handle = fopen($path, 'r');
            if ($handle === false) {
                return back()->with('error', 'Gagal membuka file CSV.');
            }

            // Ambil header
            $header = fgetcsv($handle);
            if (!$header) {
                fclose($handle);
                return back()->with('error', 'File kosong atau tidak berformat CSV.');
            }

            $rowsImported = 0;
            while (($row = fgetcsv($handle)) !== false) {
                // Pastikan jumlah kolom cocok antara header dan row
                if (count($header) !== count($row)) continue;

                $data = array_combine($header, $row);
                $email = $data['email'] ?? null;
                if (!$email) continue;

                // Pastikan model User sudah di-import di atas atau gunakan full namespace
                $user = \App\Models\User::where('email', $email)->first();

                $attrs = [];
                if (isset($data['name'])) $attrs['name'] = $data['name'];
                if (isset($data['role'])) $attrs['role'] = $data['role'];

                // Logika Password
                if (isset($data['password']) && $data['password'] !== '') {
                    $attrs['password'] = Hash::make($data['password']);
                }

                if ($user) {
                    if (!empty($attrs)) {
                        $user->update($attrs);
                        $rowsImported++;
                    }
                } else {
                    $attrs['email'] = $email;
                    // Jika tidak ada password di file, buat random
                    if (!isset($attrs['password'])) {
                        $attrs['password'] = Hash::make(bin2hex(random_bytes(6)));
                    }
                    $attrs['name'] = $attrs['name'] ?? $email;
                    $attrs['role'] = $attrs['role'] ?? 'user';

                    User::create($attrs);
                    $rowsImported++;
                }
            }
            fclose($handle);
            return back()->with('success', "Import CSV selesai. Berhasil memproses {$rowsImported} data.");
        }

        return back()->with('error', 'Format file tidak didukung atau library Excel belum terpasang.');
    }
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            // Pastikan password dikonfirmasi oleh field `password_confirmation`
            'password' => ['required', 'confirmed', Password::defaults()],
            'nim' => ['nullable', 'string'],
            'role' => 'required|in:admin,petugas,mahasiswa,user',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        // Jika role mahasiswa, buat entri di tabel mahasiswas
        if (strtolower($request->role) === 'mahasiswa') {
            $nim = $request->input('nim');
            $tahunMasuk = null;

            if (!empty($nim)) {
                // Ambil semua digit dari NIM lalu gunakan dua digit pertama sebagai tahun
                // Contoh: i.2210497 -> digits = 2210497 -> yy = 22 -> 2022
                $digits = preg_replace('/\D+/', '', $nim);
                if (strlen($digits) >= 2) {
                    $yy = intval(substr($digits, 0, 2));
                    $tahunMasuk = 2000 + $yy;
                }
            }

            Mahasiswa::create([
                'user_id' => $user->id,
                'nim' => $nim ?? null,
                'nama' => $user->name,
                'program_studi' => null,
                'kelas' => null,
                'tahun_masuk' => $tahunMasuk,
                'no_telepon' => null,
                'email' => $user->email,
            ]);
        }

        // Jika role petugas, buat entri di tabel petugas
        if (strtolower($request->role) === 'petugas') {
            $petugas = new Petugas();
            $petugas->user_id = $user->id;
            $petugas->no_induk = null;
            $petugas->nama = $user->name;
            $petugas->jabatan = null;
            $petugas->bagian = null;
            $petugas->no_telepon = null;
            $petugas->email = $user->email;
            $petugas->save();
        }

        // Jika role admin, buat entri di tabel administrators
        if (strtolower($request->role) === 'admin') {
            $admin = new Administrator();
            $admin->user_id = $user->id;
            $admin->no_induk = null;
            $admin->nama = $user->name;
            $admin->jabatan = null;
            $admin->bagian = null;
            $admin->no_telepon = null;
            $admin->email = $user->email;
            $admin->save();
        }

        return back()->with('success', 'User berhasil dibuat.');
    }
}
