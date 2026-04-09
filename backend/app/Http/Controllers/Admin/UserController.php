<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Customer;
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
            ->whereIn('role', ['admin', 'super_admin', 'boss', 'receptionist', 'pengawas', 'it'])
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
     * Boss dan IT boleh
     */
    public function storeAdminUser(Request $request)
    {
        $request->validate([
            'created_by' => 'required|exists:users,id',
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'phone' => 'nullable|string|max:50',
            'password' => 'required|string|min:6',
            'role' => ['required', Rule::in(['admin', 'super_admin', 'receptionist', 'pengawas', 'it'])],
            'status' => 'nullable|boolean',
            'hotel_ids' => 'nullable|array',
            'hotel_ids.*' => 'exists:hotels,id',
        ]);

        $creator = User::find($request->created_by);

        if (!$creator || !in_array($creator->role, ['boss', 'it'])) {
            return response()->json([
                'message' => 'Hanya boss atau IT yang boleh menambah user internal'
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

        if (in_array($user->role, ['admin', 'receptionist', 'pengawas'])) {
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
     * Boss boleh edit semua
     * IT boleh edit selain boss
     */
    public function updateAdminUser(Request $request, $id)
    {
        $request->validate([
            'updated_by' => 'required|exists:users,id',
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'role' => ['required', Rule::in(['admin', 'super_admin', 'boss', 'receptionist', 'pengawas', 'it'])],
            'status' => 'required|boolean',
            'hotel_ids' => 'nullable|array',
            'hotel_ids.*' => 'exists:hotels,id',
        ]);

        $actor = User::find($request->updated_by);

        if (!$actor || !in_array($actor->role, ['boss', 'it'])) {
            return response()->json([
                'message' => 'Hanya boss atau IT yang boleh mengubah data user internal'
            ], 403);
        }

        $user = User::findOrFail($id);

        if ($actor->role === 'it' && $user->role === 'boss') {
            return response()->json([
                'message' => 'IT tidak boleh mengubah data boss'
            ], 403);
        }

        if ($user->id === $actor->id && $actor->role === 'boss' && $request->role !== 'boss') {
            return response()->json([
                'message' => 'Boss tidak boleh menurunkan role dirinya sendiri'
            ], 422);
        }

        if ($actor->role === 'it' && $request->role === 'boss') {
            return response()->json([
                'message' => 'IT tidak boleh mengatur role menjadi boss'
            ], 403);
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

        if (in_array($user->role, ['admin', 'receptionist', 'pengawas'])) {
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
     * IT bisa reset selain boss
     */
    public function resetAdminPassword(Request $request, $id)
    {
        $request->validate([
            'new_password' => 'required|string|min:6',
            'changed_by' => 'required|exists:users,id',
        ]);

        $actor = User::find($request->changed_by);

        if (!$actor || !in_array($actor->role, ['boss', 'super_admin', 'it'])) {
            return response()->json([
                'message' => 'Hanya boss, super admin, atau IT yang boleh reset password user admin'
            ], 403);
        }

        $targetUser = User::findOrFail($id);

        if (in_array($actor->role, ['super_admin', 'it']) && $targetUser->role === 'boss') {
            return response()->json([
                'message' => 'Akun ini tidak boleh reset password boss'
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
     * Boss bisa ubah semua selain dirinya sendiri
     * IT bisa ubah selain boss
     */
    public function toggleAdminStatus(Request $request, $id)
    {
        $request->validate([
            'changed_by' => 'required|exists:users,id',
        ]);

        $actor = User::find($request->changed_by);

        if (!$actor || !in_array($actor->role, ['boss', 'it'])) {
            return response()->json([
                'message' => 'Hanya boss atau IT yang boleh mengubah status user internal'
            ], 403);
        }

        $user = User::findOrFail($id);

        if ($user->id === $actor->id && $actor->role === 'boss') {
            return response()->json([
                'message' => 'Boss tidak boleh menonaktifkan akunnya sendiri'
            ], 422);
        }

        if ($actor->role === 'it' && $user->role === 'boss') {
            return response()->json([
                'message' => 'IT tidak boleh mengubah status boss'
            ], 403);
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
     * Hapus user internal
     * Boss bisa hapus semua selain dirinya sendiri dan selain boss lain
     * IT bisa hapus selain boss
     */
    public function deleteAdminUser(Request $request, $id)
    {
        $request->validate([
            'deleted_by' => 'required|exists:users,id',
        ]);

        $actor = User::find($request->deleted_by);

        if (!$actor || !in_array($actor->role, ['boss', 'it'])) {
            return response()->json([
                'message' => 'Hanya boss atau IT yang boleh menghapus user internal'
            ], 403);
        }

        $user = User::findOrFail($id);

        if ($user->role === 'boss') {
            return response()->json([
                'message' => 'User boss tidak boleh dihapus'
            ], 403);
        }

        if ($user->id === $actor->id) {
            return response()->json([
                'message' => 'Tidak bisa menghapus akun diri sendiri'
            ], 422);
        }

        $user->hotels()->detach();
        $user->delete();

        return response()->json([
            'message' => 'User internal berhasil dihapus'
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