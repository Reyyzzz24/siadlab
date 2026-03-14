<?php

namespace App\Http\Controllers;

use App\Models\Navbar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class NavbarController extends Controller
{
    /**
     * Menampilkan daftar navbar.
     */
    public function manage(Request $request)
    {
        // Admin bisa melihat semua navbar (termasuk draft dan yang sudah lewat)
        $navbars = Navbar::all();

        return Inertia::render('Admin/Home/Navbar', [
            'navbars' => $navbars,
        ]);
    }

    /**
     * Menyimpan navbar baru ke database.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'          => 'required|string|max:255',
            'url'            => 'required|string|max:255',
            'parent_id'      => 'nullable|exists:navbars,id',
            'order_priority' => 'required|integer',
            'is_active'      => 'boolean',
            'target'         => 'required|in:_self,_blank',
            'icon'           => 'nullable|image|mimes:jpeg,png,jpg,webp|max:1024', // Asumsi ikon adalah file gambar
        ]);

        if ($request->hasFile('icon')) {
            $path = $request->file('icon')->store('navbars/icons', 'public');
            $validated['icon'] = $path;
        }

        Navbar::create($validated);

        return redirect()->back()->with('success', 'Menu berhasil dibuat!');
    }

    public function update(Request $request, Navbar $navbar)
    {
        $validated = $request->validate([
            'title'          => 'required|string|max:255',
            'url'            => 'required|string|max:255',
            'parent_id'      => 'nullable|exists:navbars,id',
            'order_priority' => 'required|integer',
            'is_active'      => 'boolean',
            'target'         => 'required|in:_self,_blank',
            'icon'           => 'nullable|image|mimes:jpeg,png,jpg,webp|max:1024',
        ]);

        if ($request->hasFile('icon')) {
            // Hapus ikon lama jika ada
            if ($navbar->icon) {
                Storage::disk('public')->delete($navbar->icon);
            }
            $path = $request->file('icon')->store('navbars/icons', 'public');
            $validated['icon'] = $path;
        }

        $navbar->update($validated);

        return redirect()->back()->with('success', 'Menu berhasil diperbarui!');
    }

    /**
     * Memindahkan navbar ke Trash (Soft Delete).
     */
    public function bulkDestroy(Request $request)
    {
        // Validasi bahwa 'ids' dikirim dan berupa array
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:navbars,id', // Pastikan setiap ID ada di tabel navbars
        ]);

        // Lakukan soft delete untuk semua ID yang dikirim
        Navbar::whereIn('id', $validated['ids'])->delete();

        return redirect()->back()->with('success', 'Menu terpilih berhasil dipindahkan ke tempat sampah!');
    }
    /**
     * Mengembalikan navbar dari Trash.
     */
    public function restore($id)
    {
        $navbar = Navbar::withTrashed()->findOrFail($id);
        $navbar->restore();

        return redirect()->back()->with('success', 'Menu berhasil dikembalikan!');
    }

    /**
     * Menghapus navbar secara permanen dari DB dan Storage.
     */
    public function forceDelete($id)
    {
        $navbar = Navbar::withTrashed()->findOrFail($id);

        // Gunakan 'icon' sesuai dengan field yang Anda simpan
        if ($navbar->icon) {
            Storage::disk('public')->delete($navbar->icon);
        }

        $navbar->forceDelete();

        return redirect()->back()->with('success', 'Menu dihapus permanen!');
    }
}
