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

        // Paginate students and preserve query string for links
        $students = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Role/Students', [
            'students' => $students,
            'filters' => $request->only(['search']),
        ]);
    }

    public function bulkDestroy(Request $request)
    {
        $request->validate(['ids' => 'required|array']);
        Mahasiswa::whereIn('id', $request->ids)->delete();

        return back()->with('success', 'Data mahasiswa berhasil dihapus.');
    }
    public function update(Request $request, $id)
    {
        $student = Mahasiswa::findOrFail($id);

        $validated = $request->validate([
            'nama'          => 'required|string|max:255',
            'email'         => 'required|email|unique:users,email,' . $student->user_id,
            'nim'           => 'required|string|unique:mahasiswas,nim,' . $student->id,
            'program_studi' => 'required|string',
            'kelas'         => 'required|in:Pagi,Sore',
            'no_telepon'    => 'nullable|string',
            'tahun_masuk'    => 'required|digits:4|integer|min:1900|max:' . (date('Y') + 1),
        ]);

        // Update tabel User (hanya name & email)
        $student->user->update($request->only(['nama', 'email']));

        // Update tabel Mahasiswa (semua field yang divalidasi + mapping name ke nama)
        $student->update(array_merge($validated, ['nama' => $validated['nama']]));

        return back()->with('success', "Mahasiswa {$student->nim} berhasil diperbarui!");
    }
}
