<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\NotificationCustom;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['data' => []]);
        }

        $notifications = NotificationCustom::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        return response()->json(['data' => $notifications]);
    }

    public function markAllRead(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['ok' => false], 401);
        }

        NotificationCustom::where('user_id', $user->id)->where('is_read', false)->update(['is_read' => true]);

        return response()->json(['ok' => true]);
    }
}
