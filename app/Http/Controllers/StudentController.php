<?php

namespace App\Http\Controllers;

use App\Models\Mahasiswa;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $query = Mahasiswa::query();

        if ($request->search) {
            $query->where('nama', 'like', "%{$request->search}%")
                ->orWhere('nim', 'like', "%{$request->search}%");
        }

        return Inertia::render('Role/Students', [
            'students' => $query->latest()->get(),
            'filters' => $request->only(['search']),
        ]);     
    }

    public function bulkDestroy(Request $request)
    {
        $request->validate(['ids' => 'required|array']);
        Mahasiswa::whereIn('id', $request->ids)->delete();

        return back()->with('success', 'Data mahasiswa berhasil dihapus.');
    }
}
