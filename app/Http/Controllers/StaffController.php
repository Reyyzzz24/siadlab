<?php

namespace App\Http\Controllers;

use App\Models\Petugas;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StaffController extends Controller
{
    public function index(Request $request)
    {
        $query = Petugas::query();

        if ($request->search) {
            $query->where('nama', 'like', "%{$request->search}%")
                ->orWhere('no_induk', 'like', "%{$request->search}%")
                ->orWhere('email', 'like', "%{$request->search}%");
        }

        return Inertia::render('Role/Staff', [
            // Kuncinya ada di sini: Harus 'staffs' agar terbaca di React
            'staffs' => $query->latest()->get(),
            'filters' => $request->only(['search']),
        ]);
    }

    public function bulkDestroy(Request $request)
    {
        $request->validate(['ids' => 'required|array']);
        Petugas::whereIn('id', $request->ids)->delete();

        return back()->with('success', 'Data Petugas berhasil dihapus.');
    }
}
