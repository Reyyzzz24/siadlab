<?php

namespace App\Http\Controllers;

use App\Models\Administrator;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdministratorController extends Controller
{
    public function index(Request $request)
    {
        $query = Administrator::query();

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('nama', 'like', "%{$request->search}%")
                    ->orWhere('no_induk', 'like', "%{$request->search}%");
            });
        }

        return Inertia::render('Role/Administrators', [
            'admins' => $query->latest()->get(),
            'filters' => $request->only(['search']),
        ]);
    }

    public function bulkDestroy(Request $request)
    {
        // Validasi pastikan ada array 'ids' yang dikirim
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:administrators,id' // Opsional: pastikan ID benar-benar ada di tabel
        ]);

        // Hapus data
        Administrator::whereIn('id', $request->ids)->delete();

        // Kembali ke halaman sebelumnya dengan pesan sukses
        return back()->with('success', 'Data Administrator berhasil dihapus.');
    }
}
