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
    public function index(Request $request)
    {
        $user = Auth::user();
        $today = now()->toDateString();
        $isAdmin = $user && in_array($user->role, ['admin', 'petugas']);

        $events = Event::query()
            // Jika ada request ?status=trash dan user adalah admin, tampilkan sampah
            ->when($request->status === 'trash' && $isAdmin, function ($query) {
                return $query->onlyTrashed();
            })
            // Filter untuk user umum (non-admin)
            ->when(!$isAdmin, function ($query) use ($today) {
                return $query->where('status', 'published')
                             ->where('tanggal', '>=', $today);
            })
            ->orderBy('tanggal', 'asc')
            ->get();

        return Inertia::render('Home/Index', [
            'events' => $events,
            'filters' => $request->only(['status'])
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
            'lokasi' => 'required|string|max:255', // TAMBAHAN LOKASI
            'poster' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2560',
            'status' => 'required|in:draft,published',
        ], [
            'poster.max' => 'Maaf, gambar yang kamu upload terlalu besar, maksimal 2.5MB',
            'lokasi.required' => 'Lokasi event harus diisi',
        ]);

        if ($request->hasFile('poster')) {
            $path = $request->file('poster')->store('events', 'public');
            $validated['poster'] = $path;
        }

        Event::create($validated);

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
            'poster' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2560',
            'status' => 'required|in:draft,published',
        ], [
            'poster.max' => 'Maaf, gambar yang kamu upload terlalu besar, maksimal 2.5MB',
        ]);

        if ($request->hasFile('poster')) {
            // Hapus poster lama hanya jika ada upload baru
            if ($event->poster) {
                Storage::disk('public')->delete($event->poster);
            }

            $path = $request->file('poster')->store('events', 'public');
            $validated['poster'] = $path;
        } else {
            // Tetap gunakan poster lama jika tidak ada file baru diupload
            unset($validated['poster']);
        }

        $event->update($validated);

        return redirect()->back()->with('success', 'Event berhasil diperbarui!');
    }

    /**
     * Memindahkan event ke Trash (Soft Delete).
     */
    public function destroy(Event $event)
    {
        // Jangan hapus poster di sini agar bisa di-restore
        $event->delete();

        return redirect()->back()->with('success', 'Event berhasil dipindahkan ke tempat sampah!');
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