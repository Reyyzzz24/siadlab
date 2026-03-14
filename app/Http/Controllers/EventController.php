<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class EventController extends Controller
{
    /**
     * Menampilkan daftar event.
     */

    public function manage(Request $request)
    {
        // 1. Ambil query builder
        $query = Event::query();

        // 2. Tambahkan filter pencarian
        if ($request->has('search') && $request->search) {
            $query->where('judul', 'like', '%' . $request->search . '%');
        }

        // 3. Tambahkan filter lainnya
        $events = $query->when($request->status === 'trash', function ($query) {
            return $query->onlyTrashed();
        })
            ->orderBy('tanggal', 'desc')
            ->get();

        return Inertia::render('Admin/Home/Events', [
            'events' => $events,
            // Tambahkan 'search' ke dalam filters agar tersinkronisasi
            'filters' => $request->only(['status', 'search'])
        ]);
    }

    /**
     * Menyimpan event baru ke database.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'judul' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'tanggal' => 'required|date',
            'lokasi' => 'required|string|max:255',
            'poster' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2560',
            'status' => 'required|in:draft,published',
        ]);

        if ($request->hasFile('poster')) {
            $path = $request->file('poster')->store('events', 'public');
            $validated['poster'] = $path;
        }

        Event::create($validated);

        // Redirect ke route manajemen agar list terupdate
        return redirect()->back()->with('success', 'Event berhasil dibuat!');
    }

    /**
     * Mengupdate event yang sudah ada.
     */
    public function update(Request $request, Event $event)
    {
        $validated = $request->validate([
            'judul' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'tanggal' => 'required|date',
            'lokasi' => 'required|string|max:255', // Pastikan lokasi juga divalidasi di sini
            'poster' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2560',
            'status' => 'required|in:draft,published',
        ]);

        if ($request->hasFile('poster')) {
            if ($event->poster) {
                Storage::disk('public')->delete($event->poster);
            }
            $path = $request->file('poster')->store('events', 'public');
            $validated['poster'] = $path;
        } else {
            unset($validated['poster']);
        }

        $event->update($validated);

        return redirect()->back()->with('success', 'Event berhasil diperbarui!');
    }

    /**
     * Memindahkan event ke Trash (Soft Delete).
     */
    public function bulkDestroy(Request $request)
    {
        // Validasi bahwa 'ids' dikirim dan berupa array
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:events,id', // Pastikan setiap ID ada di tabel
        ]);

        // Lakukan soft delete untuk semua ID yang dikirim
        Event::whereIn('id', $validated['ids'])->delete();

        return redirect()->back()->with('success', 'Event terpilih berhasil dipindahkan ke tempat sampah!');
    }

    /**
     * Mengembalikan event dari Trash.
     */
    public function restore($id)
    {
        $event = Event::withTrashed()->findOrFail($id);
        $event->restore();

        return redirect()->back()->with('success', 'Event berhasil dikembalikan!');
    }

    /**
     * Menghapus event secara permanen dari DB dan Storage.
     */
    public function forceDelete($id)
    {
        $event = Event::withTrashed()->findOrFail($id);

        // Hapus file fisik hanya saat hapus permanen
        if ($event->poster) {
            Storage::disk('public')->delete($event->poster);
        }

        $event->forceDelete();

        return redirect()->back()->with('success', 'Event dihapus secara permanen!');
    }
}
