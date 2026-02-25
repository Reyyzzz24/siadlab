<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return to_route('profile.edit');
    }

    public function updateFromModal(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $data = $request->validated();

        // 1. Update data dasar di tabel users
        $user->fill($data);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        // Logika Foto
        if ($request->hasFile('photo')) {
            if ($user->profile_photo_path) {
                Storage::disk('public')->delete($user->profile_photo_path);
            }
            $path = $request->file('photo')->store('profile-photos', 'public');
            $user->profile_photo_path = $path;
        }

        $user->save();

        // 2. Logika Sinkronisasi
        if ($user->role === 'mahasiswa') {
            $tahunMasuk = null;

            if ($request->nim) {
                // Membersihkan NIM dari spasi
                $cleanNim = trim($request->nim);
                $parts = explode('.', $cleanNim);

                // Pastikan part ke-1 ada (angka tahun)
                if (isset($parts[1])) {
                    // Ambil HANYA 2 karakter pertama dari bagian tahun (misal: 26 dari 26.10888)
                    $yearDigits = substr($parts[1], 0, 2);

                    if (is_numeric($yearDigits)) {
                        $tahunMasuk = '20' . $yearDigits; // Hasil pasti 2026
                    }
                }
            }

            $user->mahasiswa()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'nama'          => $request->name,
                    'nim'           => $request->nim,
                    'program_studi' => $request->program_studi,
                    'kelas'         => $request->kelas,
                    'no_telepon'    => $request->no_telepon,
                    'email'         => $request->email,
                    'tahun_masuk'   => (int)$tahunMasuk, // Pastikan dikirim sebagai integer
                ]
            );
        }
        // ... rest of the code (petugas & admin)
        elseif ($user->role === 'petugas') {
            $user->petugas()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'nama'       => $request->name,
                    'no_induk'   => $request->no_induk,
                    'jabatan'    => $request->jabatan,
                    'bagian'     => $request->bagian,
                    'no_telepon' => $request->no_telepon,
                ]
            );
        } elseif ($user->role === 'admin') {
            $user->administrator()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'nama'       => $request->name,
                    'no_induk'   => $request->no_induk,
                    'jabatan'    => $request->jabatan,
                    'bagian'     => $request->bagian,
                    'no_telepon' => $request->no_telepon,
                ]
            );
        }

        return redirect('/')->with('success', 'Profil dan data peranan berhasil disinkronkan!');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();

        // Cek apakah user terikat di tabel mahasiswas, administrators, atau petugas
        $hasRelation = $user->mahasiswa()->exists() ||
            $user->administrator()->exists() ||
            $user->petugas()->exists();

        if ($hasRelation) {
            return back()->with('error', 'Akun tidak bisa dihapus karena masih terhubung dengan data Mahasiswa, Administrator, atau Petugas.');
        }

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/')->with('success', 'Akun berhasil dihapus.');
    }
}
