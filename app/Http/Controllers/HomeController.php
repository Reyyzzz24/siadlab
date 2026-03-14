<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\HeroSection;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function index()
    {
        return Inertia::render('Home/Index', [
            'events' => Event::all(),
            'draftEvents' => Event::where('status', 'draft')->get(),
            'heroSections' => HeroSection::where('is_active', true)
                ->orderBy('position', 'asc')
                ->get(),
        ]);
    }
}
