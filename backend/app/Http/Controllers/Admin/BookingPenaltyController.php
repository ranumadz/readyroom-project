<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\BookingPenalty;
use App\Models\User;

class BookingPenaltyController extends Controller
{
    /**
     * Resolve user internal dari request.
     * Dipakai untuk pembatasan cabang per admin / receptionist.
     */
    private function resolveActorFromRequest(Request $request): ?User
    {
        $possibleIds = [
            $request->input('admin_user_id'),
            $request->input('current_user_id'),
            $request->input('user_id'),
            $request->query('admin_user_id'),
            $request->query('current_user_id'),
            $request->query('user_id'),
            $request->input('created_by'),
            $request->input('changed_by'),
        ];

        foreach ($possibleIds as $id) {
            if ($id) {
                $user = User::with('hotels:id,name')->find($id);
                if ($user) {
                    return $user;
                }
            }
        }

        return null;
    }

    /**
     * Boss / Super Admin / Pengawas bisa akses semua cabang.
     */
    private function canAccessAllHotels(?User $user): bool
    {
        if (!$user) return true;

        return in_array($user->role, ['boss', 'super_admin', 'pengawas']);
    }

    /**
     * Ambil daftar hotel yang boleh diakses user.
     */
    private function getAccessibleHotelIds(?User $user): array
    {
        if (!$user) return [];

        if ($this->canAccessAllHotels($user)) {
            return [];
        }

        return $user->hotels()
            ->pluck('hotels.id')
            ->map(fn ($id) => (int) $id)
            ->values()
            ->toArray();
    }

    /**
     * Cek apakah user boleh akses booking hotel tertentu.
     */
    private function userCanAccessBooking(?User $user, Booking $booking): bool
    {
        if (!$user) {
            return true;
        }

        if ($this->canAccessAllHotels($user)) {
            return true;
        }

        $accessibleHotelIds = $this->getAccessibleHotelIds($user);

        return in_array((int) $booking->hotel_id, $accessibleHotelIds);
    }

    /**
     * Ambil semua denda per booking
     */
    public function index(Request $request, $bookingId)
    {
        $actor = $this->resolveActorFromRequest($request);

        $booking = Booking::with([
            'hotel:id,name',
            'room:id,name',
            'roomUnit:id,room_number',
            'penalties.creator:id,name',
        ])->findOrFail($bookingId);

        if (!$this->userCanAccessBooking($actor, $booking)) {
            return response()->json([
                'message' => 'Kamu tidak punya akses ke booking ini',
            ], 403);
        }

        $penalties = $booking->penalties->map(function ($penalty) {
            return [
                'id' => $penalty->id,
                'booking_id' => $penalty->booking_id,
                'penalty_type' => $penalty->penalty_type,
                'title' => $penalty->title,
                'amount' => (float) $penalty->amount,
                'note' => $penalty->note,
                'created_by' => $penalty->created_by,
                'creator_name' => $penalty->creator?->name,
                'created_at' => $penalty->created_at,
                'updated_at' => $penalty->updated_at,
            ];
        })->values();

        return response()->json([
            'booking' => [
                'id' => $booking->id,
                'booking_code' => $booking->booking_code,
                'guest_name' => $booking->guest_name ?: ($booking->user?->name ?? null),
                'hotel_name' => $booking->hotel?->name,
                'room_name' => $booking->room?->name,
                'room_number' => $booking->roomUnit?->room_number,
                'status' => $booking->status,
            ],
            'penalties' => $penalties,
            'total_penalty' => (float) $booking->penalties->sum('amount'),
        ]);
    }

    /**
     * Tambah denda baru ke booking
     */
    public function store(Request $request, $bookingId)
    {
        $request->validate([
            'penalty_type' => 'nullable|string|max:100',
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'note' => 'nullable|string',
            'created_by' => 'nullable|exists:users,id',
        ]);

        $actor = $this->resolveActorFromRequest($request);

        $booking = Booking::with(['penalties'])->findOrFail($bookingId);

        if (!$this->userCanAccessBooking($actor, $booking)) {
            return response()->json([
                'message' => 'Kamu tidak punya akses ke booking ini',
            ], 403);
        }

        if (!in_array($booking->status, ['checked_out', 'cleaning', 'completed'])) {
            return response()->json([
                'message' => 'Denda hanya boleh ditambahkan setelah booking check-out / cleaning',
            ], 422);
        }

        $penalty = BookingPenalty::create([
            'booking_id' => $booking->id,
            'penalty_type' => $request->penalty_type,
            'title' => $request->title,
            'amount' => $request->amount,
            'note' => $request->note,
            'created_by' => $request->created_by ?? $actor?->id,
        ]);

        $penalty->load('creator:id,name');

        $totalPenalty = BookingPenalty::where('booking_id', $booking->id)->sum('amount');

        return response()->json([
            'message' => 'Denda berhasil ditambahkan',
            'data' => [
                'id' => $penalty->id,
                'booking_id' => $penalty->booking_id,
                'penalty_type' => $penalty->penalty_type,
                'title' => $penalty->title,
                'amount' => (float) $penalty->amount,
                'note' => $penalty->note,
                'created_by' => $penalty->created_by,
                'creator_name' => $penalty->creator?->name,
                'created_at' => $penalty->created_at,
            ],
            'total_penalty' => (float) $totalPenalty,
        ], 201);
    }

    /**
     * Hapus denda
     * Untuk sementara aman dipakai boss / super_admin / pengawas.
     */
    public function destroy(Request $request, $bookingId, $penaltyId)
    {
        $actor = $this->resolveActorFromRequest($request);

        if (!$actor || !in_array($actor->role, ['boss', 'super_admin', 'pengawas'])) {
            return response()->json([
                'message' => 'Hanya boss / super_admin / pengawas yang boleh menghapus denda',
            ], 403);
        }

        $booking = Booking::findOrFail($bookingId);

        if (!$this->userCanAccessBooking($actor, $booking)) {
            return response()->json([
                'message' => 'Kamu tidak punya akses ke booking ini',
            ], 403);
        }

        $penalty = BookingPenalty::where('booking_id', $booking->id)
            ->where('id', $penaltyId)
            ->firstOrFail();

        $penalty->delete();

        $totalPenalty = BookingPenalty::where('booking_id', $booking->id)->sum('amount');

        return response()->json([
            'message' => 'Denda berhasil dihapus',
            'total_penalty' => (float) $totalPenalty,
        ]);
    }
}