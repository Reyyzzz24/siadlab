<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EnsureAdminOrPetugas
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $user = Auth::user();

        // Jika tidak login ATAU role bukan admin/petugas
        if (!$user || !in_array($user->role, ['admin', 'petugas'])) {

            // Proses Logout Paksa
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            // Lempar kembali ke login dengan pesan error
            return redirect()->route('login')->with('error', 'Akses ditolak. Anda harus login sebagai Admin.');
        }

        return $next($request);
    }
}
