<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class UpdateAdminLastSeen
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $this->isAllowedRole($user->role ?? null)) {
            $lastSeenAt = $user->last_seen_at;

            $shouldUpdate =
                !$lastSeenAt ||
                now()->diffInSeconds($lastSeenAt) >= 60;

            if ($shouldUpdate) {
                $user->forceFill([
                    'last_seen_at' => now(),
                ])->saveQuietly();
            }
        }

        return $next($request);
    }

    private function isAllowedRole(?string $role): bool
    {
        return in_array(strtolower((string) $role), [
            'admin',
            'super_admin',
            'boss',
            'receptionist',
            'pengawas',
            'it',
            'housekeeping',
        ], true);
    }
}