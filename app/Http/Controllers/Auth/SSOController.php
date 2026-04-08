<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;

class SSOController extends Controller
{
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('portal')->redirect();
    }

    public function callback(): RedirectResponse
    {
        try {
            $portalUser = Socialite::driver('portal')->user();
            $rawUser = $portalUser->getRaw();

            $user = User::where('email', $portalUser->getEmail())->first();

            if (!$user) {
                $user = User::create([
                    'name' => $portalUser->getName(),
                    'email' => $portalUser->getEmail(),
                    'password' => bcrypt(str()->random(32)),
                    'email_verified_at' => now(),
                    'portal_id' => $portalUser->getId(),
                    // Pastikan key 'role' sesuai dengan apa yang dikirim Portal
                    'role' => $rawUser['role'] ?? 'user',
                ]);
            } else {
                $updateData = [];
                if (!$user->portal_id) {
                    $updateData['portal_id'] = $portalUser->getId();
                }
                if (isset($rawUser['role'])) {
                    $updateData['role'] = $rawUser['role'];
                }
                if (!empty($updateData)) {
                    $user->update($updateData);
                }
            }

            request()->session()->forget('url.intended');
            request()->session()->regenerate();

            Auth::login($user, true);

            if ($user->role === 'admin' || $user->role === 'superadmin') {
                return redirect()->to('/admin/dashboard');
            }

            return redirect()->to('/');
        } catch (\Exception $e) {
            Log::error('SSO Callback Error: ' . $e->getMessage());
            return redirect()->route('home')->with('error', 'Gagal login via SSO.');
        }
    }

    public function logout(): RedirectResponse
    {
        Auth::logout();
        request()->session()->invalidate();
        request()->session()->regenerateToken();

        return redirect('/');
    }
}
