<?php

namespace App\Http\Controllers;

use App\Models\HeroSection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class HeroSectionController extends Controller
{
    /**
     * Menampilkan daftar hero section untuk admin.
     */
    public function manage(Request $request)
    {
        $heroSections = HeroSection::withTrashed()
            ->when($request->input('search'), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('subtitle', 'like', "%{$search}%");
                });
            })
            ->orderBy('position', 'asc')
            ->get();

        return Inertia::render('Admin/Home/HeroSection', [
            'heroSections' => $heroSections,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Menyimpan hero section baru ke database.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'      => 'required|string|max:255',
            'subtitle'   => 'nullable|string|max:255',
            'image_path' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'cta_text'   => 'nullable|string|max:100',
            'cta_link'   => 'nullable|string|max:255',
            'position'   => 'required|integer',
            'is_active'  => 'boolean',
        ]);

        if ($request->hasFile('image_path')) {
            $path = $request->file('image_path')->store('hero/images', 'public');
            $validated['image_path'] = $path;
        }

        HeroSection::create($validated);

        return redirect()->back()->with('success', 'Hero section berhasil dibuat!');
    }

    public function update(Request $request, HeroSection $heroSection)
    {
        $validated = $request->validate([
            'title'      => 'required|string|max:255',
            'subtitle'   => 'nullable|string|max:255',
            'image_path' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'cta_text'   => 'nullable|string|max:100',
            'cta_link'   => 'nullable|string|max:255',
            'position'   => 'required|integer',
            'is_active'  => 'boolean',
        ]);

        if ($request->hasFile('image_path')) {
            if ($heroSection->image_path) {
                Storage::disk('public')->delete($heroSection->image_path);
            }
            $path = $request->file('image_path')->store('hero/images', 'public');
            $validated['image_path'] = $path;
        }

        $heroSection->update($validated);

        return redirect()->back()->with('success', 'Hero section berhasil diperbarui!');
    }

    public function bulkDestroy(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:hero_sections,id',
        ]);

        HeroSection::whereIn('id', $validated['ids'])->delete();

        return redirect()->back()->with('success', 'Hero section terpilih berhasil dihapus!');
    }

    public function restore($id)
    {
        $hero = HeroSection::withTrashed()->findOrFail($id);
        $hero->restore();

        return redirect()->back()->with('success', 'Hero section berhasil dikembalikan!');
    }

    public function forceDelete($id)
    {
        $hero = HeroSection::withTrashed()->findOrFail($id);

        if ($hero->image_path) {
            Storage::disk('public')->delete($hero->image_path);
        }

        $hero->forceDelete();

        return redirect()->back()->with('success', 'Hero section dihapus permanen!');
    }
}
