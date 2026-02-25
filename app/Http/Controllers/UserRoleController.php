<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

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

        $users = $query->orderBy('name')->get();

        return Inertia::render('Role/Users', [
            'users' => $users,
            'filters' => $request->only('search'),
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'role' => 'required|string',
        ]);

        $allowed = ['admin', 'petugas', 'mahasiswa', 'user'];
        if (!in_array($validated['role'], $allowed)) {
            return redirect()->back()->with('error', 'Role tidak valid.');
        }

        $user = User::findOrFail($id);
        $user->role = $validated['role'];
        $user->save();

        return redirect()->back()->with('success', 'Role pengguna berhasil diperbarui.');
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
}
