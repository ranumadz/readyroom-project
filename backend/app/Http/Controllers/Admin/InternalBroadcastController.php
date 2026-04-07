<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\InternalBroadcast;
use App\Models\InternalBroadcastDismissal;
use App\Models\User;
use Illuminate\Validation\Rule;

class InternalBroadcastController extends Controller
{
    /**
     * Ambil semua broadcast
     * IT dan boss boleh lihat
     */
    public function index(Request $request)
    {
        $userId = $request->query('user_id');
        $actor = $userId ? User::find($userId) : null;

        if (!$actor || !in_array($actor->role, ['it', 'boss'])) {
            return response()->json([
                'message' => 'Hanya IT atau boss yang boleh melihat data broadcast internal'
            ], 403);
        }

        $broadcasts = InternalBroadcast::with(['sender:id,name,email,role'])
            ->latest()
            ->get();

        return response()->json($broadcasts);
    }

    /**
     * Ambil broadcast aktif untuk user tertentu
     * Boss tidak menerima
     * Broadcast yang sudah didismiss user tidak ditampilkan lagi
     */
    public function active(Request $request)
    {
        $request->validate([
            'role' => [
                'required',
                Rule::in(['boss', 'super_admin', 'admin', 'receptionist', 'pengawas', 'it'])
            ],
            'user_id' => 'required|exists:users,id',
        ]);

        $role = strtolower($request->role);
        $userId = (int) $request->user_id;

        if (in_array($role, ['boss', 'it'])) {
            return response()->json([]);
        }

        $dismissedIds = InternalBroadcastDismissal::where('user_id', $userId)
            ->pluck('internal_broadcast_id')
            ->toArray();

        $broadcasts = InternalBroadcast::with(['sender:id,name,email,role'])
            ->where('is_active', true)
            ->whereNotIn('id', $dismissedIds)
            ->latest()
            ->get()
            ->filter(function ($broadcast) use ($role) {
                $targetRoles = is_array($broadcast->target_roles)
                    ? $broadcast->target_roles
                    : [];

                return in_array($role, $targetRoles);
            })
            ->values();

        return response()->json($broadcasts);
    }

    /**
     * Buat broadcast baru
     * Hanya IT yang boleh
     */
    public function store(Request $request)
    {
        $request->validate([
            'sent_by' => 'required|exists:users,id',
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'target_roles' => 'required|array|min:1',
            'target_roles.*' => [
                'required',
                Rule::in(['super_admin', 'admin', 'receptionist', 'pengawas']),
            ],
            'show_as_modal' => 'nullable|boolean',
            'show_as_banner' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
        ]);

        $sender = User::find($request->sent_by);

        if (!$sender || $sender->role !== 'it') {
            return response()->json([
                'message' => 'Hanya role IT yang boleh membuat broadcast internal'
            ], 403);
        }

        $targetRoles = collect($request->target_roles)
            ->map(fn ($role) => strtolower(trim($role)))
            ->filter()
            ->unique()
            ->values()
            ->toArray();

        $broadcast = InternalBroadcast::create([
            'sent_by' => $sender->id,
            'title' => $request->title,
            'message' => $request->message,
            'target_roles' => $targetRoles,
            'is_active' => $request->has('is_active') ? (bool) $request->is_active : true,
            'show_as_modal' => $request->has('show_as_modal') ? (bool) $request->show_as_modal : true,
            'show_as_banner' => $request->has('show_as_banner') ? (bool) $request->show_as_banner : false,
        ]);

        $broadcast->load(['sender:id,name,email,role']);

        return response()->json([
            'message' => 'Broadcast internal berhasil dibuat',
            'data' => $broadcast,
        ], 201);
    }

    /**
     * Update broadcast
     * Hanya IT
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'updated_by' => 'required|exists:users,id',
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'target_roles' => 'required|array|min:1',
            'target_roles.*' => [
                'required',
                Rule::in(['super_admin', 'admin', 'receptionist', 'pengawas']),
            ],
            'show_as_modal' => 'nullable|boolean',
            'show_as_banner' => 'nullable|boolean',
            'is_active' => 'required|boolean',
        ]);

        $actor = User::find($request->updated_by);

        if (!$actor || $actor->role !== 'it') {
            return response()->json([
                'message' => 'Hanya role IT yang boleh mengubah broadcast internal'
            ], 403);
        }

        $broadcast = InternalBroadcast::findOrFail($id);

        $targetRoles = collect($request->target_roles)
            ->map(fn ($role) => strtolower(trim($role)))
            ->filter()
            ->unique()
            ->values()
            ->toArray();

        $broadcast->update([
            'title' => $request->title,
            'message' => $request->message,
            'target_roles' => $targetRoles,
            'is_active' => (bool) $request->is_active,
            'show_as_modal' => $request->has('show_as_modal') ? (bool) $request->show_as_modal : true,
            'show_as_banner' => $request->has('show_as_banner') ? (bool) $request->show_as_banner : false,
        ]);

        $broadcast->load(['sender:id,name,email,role']);

        return response()->json([
            'message' => 'Broadcast internal berhasil diupdate',
            'data' => $broadcast,
        ]);
    }

    /**
     * Dismiss broadcast untuk user tertentu
     * Sekali dismiss, tidak muncul lagi untuk user itu
     */
    public function dismiss(Request $request, $id)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = User::findOrFail($request->user_id);
        $broadcast = InternalBroadcast::findOrFail($id);

        if (in_array($user->role, ['boss', 'it'])) {
            return response()->json([
                'message' => 'Role ini tidak menggunakan dismiss broadcast'
            ], 403);
        }

        $targetRoles = is_array($broadcast->target_roles) ? $broadcast->target_roles : [];

        if (!in_array($user->role, $targetRoles)) {
          return response()->json([
              'message' => 'Broadcast ini bukan untuk role user tersebut'
          ], 403);
        }

        InternalBroadcastDismissal::firstOrCreate(
            [
                'user_id' => $user->id,
                'internal_broadcast_id' => $broadcast->id,
            ],
            [
                'dismissed_at' => now(),
            ]
        );

        return response()->json([
            'message' => 'Broadcast berhasil ditutup untuk user ini'
        ]);
    }

    /**
     * Aktif / nonaktifkan broadcast
     * Hanya IT
     */
    public function toggleStatus(Request $request, $id)
    {
        $request->validate([
            'changed_by' => 'required|exists:users,id',
        ]);

        $actor = User::find($request->changed_by);

        if (!$actor || $actor->role !== 'it') {
            return response()->json([
                'message' => 'Hanya role IT yang boleh mengubah status broadcast internal'
            ], 403);
        }

        $broadcast = InternalBroadcast::findOrFail($id);

        $broadcast->update([
            'is_active' => !$broadcast->is_active,
        ]);

        return response()->json([
            'message' => 'Status broadcast internal berhasil diubah',
            'data' => $broadcast,
        ]);
    }

    /**
     * Hapus broadcast
     * Hanya IT
     */
    public function destroy(Request $request, $id)
    {
        $request->validate([
            'deleted_by' => 'required|exists:users,id',
        ]);

        $actor = User::find($request->deleted_by);

        if (!$actor || $actor->role !== 'it') {
            return response()->json([
                'message' => 'Hanya role IT yang boleh menghapus broadcast internal'
            ], 403);
        }

        $broadcast = InternalBroadcast::findOrFail($id);
        $broadcast->delete();

        return response()->json([
            'message' => 'Broadcast internal berhasil dihapus',
        ]);
    }
}