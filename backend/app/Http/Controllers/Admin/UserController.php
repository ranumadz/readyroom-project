<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Customer;
use App\Models\Hotel;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Ambil semua user internal panel admin
     */
    public function adminUsers()
    {
        $users = User::with(['hotels:id,name'])
            ->whereIn('role', ['admin', 'super_admin', 'boss', 'receptionist'])
            ->latest()
            ->get();

        return response()->json($users);
    }

    /**
     * Ambil semua customer dari tabel customers
     */
    public function customers()
    {
        $customers = Customer::latest()->get();

        return response()->json($customers);
    }

    /**
     * Tambah user internal
     * Hanya boss yang boleh
     */
    public function storeAdminUser(Request $request)
    {
        $request->validate([
            'created_by' => 'required|exists:users,id',
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'phone' => 'nullable|string|max:50',
            'password' => 'required|string|min:6',
            'role' => ['required', Rule::in(['admin', 'super_admin', 'receptionist'])],
            'status' => 'nullable|boolean',

            // cabang hotel
            'hotel_ids' => 'nullable|array',
            'hotel_ids.*' => 'exists:hotels,id',
        ]);

        $creator = User::find($request->created_by);

        if (!$creator || $creator->role !== 'boss') {
            return response()->json([
                'message' => 'Hanya boss yang boleh menambah user internal'
            ], 403);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'status' => $request->has('status') ? (bool) $request->status : true,
        ]);

        $hotelIds = collect($request->hotel_ids ?? [])
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values()
            ->toArray();

        // admin & receptionist dibatasi cabang
        // super_admin tidak dibatasi cabang
        if (in_array($user->role, ['admin', 'receptionist'])) {
            $user->hotels()->sync($hotelIds);
        } else {
            $user->hotels()->sync([]);
        }

        $user->load(['hotels:id,name']);

        return response()->json([
            'message' => 'User internal berhasil ditambahkan',
            'data' => $user
        ], 201);
    }

    /**
     * Update role / data user internal
     * Hanya boss yang boleh
     */
    public function updateAdminUser(Request $request, $id)
    {
        $request->validate([
            'updated_by' => 'required|exists:users,id',
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'role' => ['required', Rule::in(['admin', 'super_admin', 'boss', 'receptionist'])],
            'status' => 'required|boolean',

            // cabang hotel
            'hotel_ids' => 'nullable|array',
            'hotel_ids.*' => 'exists:hotels,id',
        ]);

        $actor = User::find($request->updated_by);

        if (!$actor || $actor->role !== 'boss') {
            return response()->json([
                'message' => 'Hanya boss yang boleh mengubah data user internal'
            ], 403);
        }

        $user = User::findOrFail($id);

        if ($user->id === $actor->id && $request->role !== 'boss') {
            return response()->json([
                'message' => 'Boss tidak boleh menurunkan role dirinya sendiri'
            ], 422);
        }

        $emailExists = User::where('email', $request->email)
            ->where('id', '!=', $user->id)
            ->exists();

        if ($emailExists) {
            return response()->json([
                'message' => 'Email sudah digunakan user lain'
            ], 422);
        }

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'role' => $request->role,
            'status' => (bool) $request->status,
        ]);

        $hotelIds = collect($request->hotel_ids ?? [])
            ->map(fn ($idValue) => (int) $idValue)
            ->unique()
            ->values()
            ->toArray();

        // admin & receptionist dibatasi cabang
        // boss / super_admin tidak dibatasi cabang
        if (in_array($user->role, ['admin', 'receptionist'])) {
            $user->hotels()->sync($hotelIds);
        } else {
            $user->hotels()->sync([]);
        }

        $user->load(['hotels:id,name']);

        return response()->json([
            'message' => 'User internal berhasil diupdate',
            'data' => $user
        ]);
    }

    /**
     * Reset password user internal
     * Boss bisa reset semua
     * Super admin bisa reset selain boss
     */
    public function resetAdminPassword(Request $request, $id)
    {
        $request->validate([
            'new_password' => 'required|string|min:6',
            'changed_by' => 'required|exists:users,id',
        ]);

        $actor = User::find($request->changed_by);

        if (!$actor || !in_array($actor->role, ['boss', 'super_admin'])) {
            return response()->json([
                'message' => 'Hanya boss atau super admin yang boleh reset password user admin'
            ], 403);
        }

        $targetUser = User::findOrFail($id);

        if ($actor->role === 'super_admin' && $targetUser->role === 'boss') {
            return response()->json([
                'message' => 'Super admin tidak boleh reset password boss'
            ], 403);
        }

        $targetUser->update([
            'password' => Hash::make($request->new_password),
        ]);

        return response()->json([
            'message' => 'Password user admin berhasil direset'
        ]);
    }

    /**
     * Aktif / nonaktif user internal
     * Hanya boss
     */
    public function toggleAdminStatus(Request $request, $id)
    {
        $request->validate([
            'changed_by' => 'required|exists:users,id',
        ]);

        $actor = User::find($request->changed_by);

        if (!$actor || $actor->role !== 'boss') {
            return response()->json([
                'message' => 'Hanya boss yang boleh mengubah status user internal'
            ], 403);
        }

        $user = User::findOrFail($id);

        if ($user->id === $actor->id) {
            return response()->json([
                'message' => 'Boss tidak boleh menonaktifkan akunnya sendiri'
            ], 422);
        }

        $user->update([
            'status' => !$user->status
        ]);

        return response()->json([
            'message' => 'Status user internal berhasil diubah',
            'data' => $user
        ]);
    }

    /**
     * Reset password customer
     * Hanya boss / super_admin
     */
    public function resetCustomerPassword(Request $request, $id)
    {
        $request->validate([
            'new_password' => 'required|string|min:6',
            'changed_by' => 'required|exists:users,id',
        ]);

        $actor = User::find($request->changed_by);

        if (!$actor || !in_array($actor->role, ['boss', 'super_admin'])) {
            return response()->json([
                'message' => 'Hanya boss atau super admin yang boleh reset password customer'
            ], 403);
        }

        $customer = Customer::findOrFail($id);

        $customer->update([
            'password' => Hash::make($request->new_password),
        ]);

        return response()->json([
            'message' => 'Password customer berhasil direset'
        ]);
    }

    /**
     * Aktif / nonaktif customer
     * Boss / super_admin
     */
    public function toggleCustomerStatus(Request $request, $id)
    {
        $request->validate([
            'changed_by' => 'required|exists:users,id',
        ]);

        $actor = User::find($request->changed_by);

        if (!$actor || !in_array($actor->role, ['boss', 'super_admin'])) {
            return response()->json([
                'message' => 'Hanya boss atau super admin yang boleh mengubah status customer'
            ], 403);
        }

        $customer = Customer::findOrFail($id);

        $customer->update([
            'status' => !$customer->status
        ]);

        return response()->json([
            'message' => 'Status customer berhasil diubah',
            'data' => $customer
        ]);
    }
}