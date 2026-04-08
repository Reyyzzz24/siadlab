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

        // Paginate staffs and preserve query string for links
        $staffs = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Role/Staff', [
            // Kuncinya ada di sini: Harus 'staffs' agar terbaca di React
            'staffs' => $staffs,
            'filters' => $request->only(['search']),
        ]);
    }

    public function bulkDestroy(Request $request)
    {
        $request->validate(['ids' => 'required|array']);
        Petugas::whereIn('id', $request->ids)->delete();

        return back()->with('success', 'Data Petugas berhasil dihapus.');
    }
    public function update(Request $request, $id)
    {
        $staff = Petugas::findOrFail($id); // Sesuaikan nama Model Anda

        $validated = $request->validate([
            'nama'       => 'required|string|max:255',
            'email'      => 'required|email|unique:users,email,' . $staff->user_id,
            'no_induk'   => 'required|string|unique:petugas,no_induk,' . $staff->id,
            'jabatan'    => 'required|string',
            'bagian'     => 'required|string',
            'no_telepon' => 'nullable|string',
        ]);

        $staff->user->update($request->only(['nama', 'email']));
        $staff->update(array_merge($validated, ['nama' => $validated['nama']]));

        return back()->with('success', "Staff {$staff->no_induk} berhasil diperbarui!");
    }
}
