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
        if (!$user || !in_array($user->role, ['admin', 'petugas'])) {
            abort(403, 'Unauthorized.');
        }

        return $next($request);
    }
}
