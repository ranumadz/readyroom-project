<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\Room;
use App\Models\RoomUnit;
use App\Models\User;
use App\Models\Hotel;
use Carbon\Carbon;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
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
            $request->input('edited_by'),
            $request->input('refunded_by'),
            $request->input('cancelled_by'),
            $request->input('deleted_by'),
            $request->query('deleted_by'),
            $request->input('changed_by'),
            $request->input('actor_id'),
            $request->query('actor_id'),
            $request->input('cleaning_started_by'),
            $request->input('cleaning_finished_by'),
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
     * Cek kolom booking secara aman.
     * Dipakai supaya controller ini tetap aman meskipun migration cleaning detail
     * belum dijalankan di production.
     */
    private function bookingHasColumn(string $column): bool
    {
        static $columnCache = [];

        if (!array_key_exists($column, $columnCache)) {
            $columnCache[$column] = Schema::hasColumn('bookings', $column);
        }

        return $columnCache[$column];
    }

    /**
     * Cek apakah tabel bookings punya kolom soft delete / arsip.
     * Kalau kolom deleted_at tersedia, booking bisa disembunyikan dari admin list
     * tanpa hard delete data.
     */
    private function canSoftArchiveBooking(): bool
    {
        return $this->bookingHasColumn('deleted_at');
    }

    /**
     * Ambil nama user untuk data ringan di response Booking List.
     * Detail ini boleh dipakai frontend saat status masih cleaning,
     * tapi tidak wajib ditampilkan setelah cleaning selesai.
     */
    private function getUserNameById($userId): ?string
    {
        if (!$userId) {
            return null;
        }

        return User::where('id', $userId)->value('name');
    }

    /**
     * Tambahkan meta cleaning ringan ke object booking tanpa wajib relasi baru di Model.
     */
    private function appendCleaningMeta(Booking $booking): Booking
    {
        if ($this->bookingHasColumn('cleaning_started_by')) {
            $booking->cleaning_started_by_name = $this->getUserNameById($booking->cleaning_started_by);
        }

        if ($this->bookingHasColumn('cleaning_finished_by')) {
            $booking->cleaning_finished_by_name = $this->getUserNameById($booking->cleaning_finished_by);
        }

        if (
            $this->bookingHasColumn('cleaning_started_at') &&
            $this->bookingHasColumn('cleaning_estimated_minutes') &&
            $booking->cleaning_started_at
        ) {
            $estimatedMinutes = (int) ($booking->cleaning_estimated_minutes ?: 15);
            $booking->cleaning_estimated_finish_at = Carbon::parse($booking->cleaning_started_at)
                ->addMinutes($estimatedMinutes)
                ->toDateTimeString();
        }

        return $booking;
    }

    /**
     * Siapkan payload update cleaning secara aman.
     * Kalau kolom belum ada, field tersebut otomatis dilewati.
     */
    private function buildSafeBookingUpdate(array $payload): array
    {
        $safePayload = [];

        foreach ($payload as $column => $value) {
            if ($column === 'status' || $this->bookingHasColumn($column)) {
                $safePayload[$column] = $value;
            }
        }

        return $safePayload;
    }

    /**
     * Cek apakah user boleh akses hotel tertentu.
     */
    private function userCanAccessHotel(?User $user, $hotelId): bool
    {
        if (!$user) {
            return true;
        }

        if ($this->canAccessAllHotels($user)) {
            return true;
        }

        $accessibleHotelIds = $this->getAccessibleHotelIds($user);

        return in_array((int) $hotelId, $accessibleHotelIds);
    }

    public function index(Request $request)
    {
        $actor = $this->resolveActorFromRequest($request);
        $accessibleHotelIds = $this->getAccessibleHotelIds($actor);

        $bookingsQuery = Booking::with([
            'user',
            'creator',
            'editor',
            'refunder',
            'canceller',
            'hotel',
            'room',
            'roomUnit',
            'penalties.creator',
        ])->latest();

        if ($this->canSoftArchiveBooking()) {
            $bookingsQuery->whereNull('deleted_at');
        }

        if (!$this->canAccessAllHotels($actor) && !empty($accessibleHotelIds)) {
            $bookingsQuery->whereIn('hotel_id', $accessibleHotelIds);
        }

        if (!$this->canAccessAllHotels($actor) && empty($accessibleHotelIds) && $actor) {
            $bookingsQuery->whereRaw('1 = 0');
        }

        $bookings = $bookingsQuery->get()
            ->map(function ($booking) {
                if (empty($booking->guest_name) && $booking->user) {
                    $booking->guest_name = $booking->user->name;
                }

                if (empty($booking->guest_phone) && $booking->user) {
                    $booking->guest_phone = $booking->user->phone;
                }

                $booking->total_penalty = (float) $booking->penalties->sum('amount');

                return $this->appendCleaningMeta($booking);
            })
            ->values();

        return response()->json($bookings);
    }

    public function calendar(Request $request)
    {
        $actor = $this->resolveActorFromRequest($request);
        $accessibleHotelIds = $this->getAccessibleHotelIds($actor);

        $requestedHotelId = $request->query('hotel_id');
        $month = (int) $request->query('month', now()->month);
        $year = (int) $request->query('year', now()->year);

        $hotelId = $requestedHotelId ? (int) $requestedHotelId : null;

        if ($hotelId && !$this->userCanAccessHotel($actor, $hotelId)) {
            return response()->json([
                'filters' => [
                    'hotel_id' => $hotelId,
                    'month' => $month,
                    'year' => $year,
                ],
                'hotels' => [],
                'room_units' => [],
                'bookings' => [],
            ]);
        }

        $startDate = Carbon::create($year, $month, 1)->startOfMonth();
        $endDate = Carbon::create($year, $month, 1)->endOfMonth();

        $hotelsQuery = Hotel::select('id', 'name')->orderBy('name');

        if (!$this->canAccessAllHotels($actor) && !empty($accessibleHotelIds)) {
            $hotelsQuery->whereIn('id', $accessibleHotelIds);
        }

        if (!$this->canAccessAllHotels($actor) && empty($accessibleHotelIds) && $actor) {
            $hotelsQuery->whereRaw('1 = 0');
        }

        $hotels = $hotelsQuery->get();

        $roomUnitsQuery = RoomUnit::with([
            'room:id,hotel_id,name',
        ])
            ->whereHas('room', function ($query) use ($hotelId, $actor, $accessibleHotelIds) {
                if ($hotelId) {
                    $query->where('hotel_id', $hotelId);
                }

                if (!$this->canAccessAllHotels($actor) && !empty($accessibleHotelIds)) {
                    $query->whereIn('hotel_id', $accessibleHotelIds);
                }

                if (!$this->canAccessAllHotels($actor) && empty($accessibleHotelIds) && $actor) {
                    $query->whereRaw('1 = 0');
                }
            })
            ->where('status', 1);

        $roomUnits = $roomUnitsQuery
            ->get()
            ->map(function ($unit) {
                return [
                    'id' => $unit->id,
                    'room_number' => $unit->room_number,
                    'room_id' => $unit->room_id,
                    'room_name' => $unit->room?->name,
                    'hotel_id' => $unit->room?->hotel_id,
                ];
            })
            ->values();

        $bookingsQuery = Booking::with([
            'user:id,name,phone',
            'hotel:id,name',
            'room:id,hotel_id,name',
            'roomUnit:id,room_id,room_number',
        ])
            ->whereNotNull('room_unit_id')
            ->where(function ($query) use ($startDate, $endDate) {
                $query->where('check_in', '<=', $endDate)
                    ->where('check_out', '>=', $startDate);
            });

        if ($this->canSoftArchiveBooking()) {
            $bookingsQuery->whereNull('deleted_at');
        }

        if ($hotelId) {
            $bookingsQuery->where('hotel_id', $hotelId);
        }

        if (!$this->canAccessAllHotels($actor) && !empty($accessibleHotelIds)) {
            $bookingsQuery->whereIn('hotel_id', $accessibleHotelIds);
        }

        if (!$this->canAccessAllHotels($actor) && empty($accessibleHotelIds) && $actor) {
            $bookingsQuery->whereRaw('1 = 0');
        }

        $bookings = $bookingsQuery
            ->orderBy('check_in')
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'booking_code' => $booking->booking_code,
                    'guest_name' => $booking->guest_name ?: ($booking->user?->name ?? null),
                    'guest_phone' => $booking->guest_phone ?: ($booking->user?->phone ?? null),
                    'hotel_id' => $booking->hotel_id,
                    'room_id' => $booking->room_id,
                    'room_unit_id' => $booking->room_unit_id,
                    'room_name' => $booking->room?->name,
                    'room_number' => $booking->roomUnit?->room_number,
                    'check_in' => $booking->check_in,
                    'check_out' => $booking->check_out,
                    'status' => $booking->status,
                    'payment_status' => $booking->payment_status,
                    'booking_type' => $booking->booking_type,
                    'duration_hours' => $booking->duration_hours,
                    'duration_days' => $booking->duration_days,
                    'payment_method' => $booking->payment_method ?? null,
                    'paid_amount' => $booking->paid_amount ?? null,
                    'payment_note' => $booking->payment_note ?? null,
                ];
            })
            ->values();

        return response()->json([
            'filters' => [
                'hotel_id' => $hotelId ? (int) $hotelId : null,
                'month' => $month,
                'year' => $year,
            ],
            'hotels' => $hotels,
            'room_units' => $roomUnits,
            'bookings' => $bookings,
        ]);
    }

    /**
     * Cek apakah kamar fisik tersedia pada rentang waktu tertentu
     * Aman untuk transit dan overnight
     */
    private function isRoomUnitAvailable($roomUnitId, $checkIn, $checkOut, $ignoreBookingId = null)
    {
        $query = Booking::where('room_unit_id', $roomUnitId)
            ->whereIn('status', ['confirmed', 'checked_in'])
            ->where(function ($q) use ($checkIn, $checkOut) {
                $q->where('check_in', '<', $checkOut)
                    ->where('check_out', '>', $checkIn);
            });

        if ($ignoreBookingId) {
            $query->where('id', '!=', $ignoreBookingId);
        }

        return !$query->exists();
    }

    /**
     * Generate booking code otomatis
     * Contoh: RR-20260319-0001
     */
    private function generateBookingCode()
    {
        $date = now()->format('Ymd');
        $lastBooking = Booking::latest('id')->first();
        $nextNumber = $lastBooking ? $lastBooking->id + 1 : 1;

        return 'RR-' . $date . '-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Hitung checkout overnight untuk hotel budget:
     * - check-in sebelum jam 12 siang => checkout hari itu jam 12:00
     * - check-in jam 12 siang atau setelahnya => checkout besok jam 12:00
     */
    private function calculateOvernightCheckOut(Carbon $checkIn): Carbon
    {
        $sameDayNoon = (clone $checkIn)->setTime(12, 0, 0);

        if ($checkIn->lt($sameDayNoon)) {
            return $sameDayNoon;
        }

        return $sameDayNoon->addDay();
    }

    /**
     * Hitung checkout overnight multi-hari.
     * Logic lama tetap dipakai sebagai base minimum checkout,
     * lalu ditambah (duration_days - 1) hari.
     */
    private function calculateOvernightCheckOutByDays(Carbon $checkIn, int $durationDays = 1): Carbon
    {
        $durationDays = max(1, $durationDays);
        $baseCheckOut = $this->calculateOvernightCheckOut($checkIn);

        if ($durationDays <= 1) {
            return $baseCheckOut;
        }

        return (clone $baseCheckOut)->addDays($durationDays - 1);
    }

    // ✅ APPROVE BOOKING CUSTOMER
    public function approve(Request $request, $id)
    {
        $request->validate([
            'room_unit_id' => 'required|exists:room_units,id',
            'admin_note' => 'nullable|string',
        ]);

        $booking = Booking::findOrFail($id);

        if ($booking->status !== 'pending') {
            return response()->json([
                'message' => 'Booking sudah diproses sebelumnya'
            ], 422);
        }

        $roomUnit = RoomUnit::findOrFail($request->room_unit_id);

        if ((int) $roomUnit->room_id !== (int) $booking->room_id) {
            return response()->json([
                'message' => 'Kamar fisik tidak sesuai dengan tipe kamar booking ini'
            ], 422);
        }

        if ((int) $roomUnit->status === 0) {
            return response()->json([
                'message' => 'Kamar fisik sedang tidak aktif / tidak tersedia'
            ], 422);
        }

        if (
            !$this->isRoomUnitAvailable(
                $roomUnit->id,
                $booking->check_in,
                $booking->check_out,
                $booking->id
            )
        ) {
            return response()->json([
                'message' => 'Kamar bentrok dengan booking lain pada jam tersebut'
            ], 422);
        }

        $booking->update([
            'room_unit_id' => $roomUnit->id,
            'status' => 'confirmed',
            'admin_note' => $request->admin_note,
        ]);

        return response()->json([
            'message' => 'Booking berhasil di-approve',
            'data' => $booking->load(['user', 'creator', 'editor', 'refunder', 'canceller', 'hotel', 'room', 'roomUnit'])
        ]);
    }

    // ❌ REJECT BOOKING
    public function reject(Request $request, $id)
    {
        $request->validate([
            'rejection_reason_customer' => 'required|string',
            'rejection_reason_internal' => 'nullable|string',
        ]);

        $booking = Booking::findOrFail($id);

        if ($booking->status !== 'pending') {
            return response()->json([
                'message' => 'Booking sudah diproses sebelumnya'
            ], 422);
        }

        $booking->update([
            'status' => 'cancelled',
            'rejection_reason_customer' => $request->rejection_reason_customer,
            'rejection_reason_internal' => $request->rejection_reason_internal,
        ]);

        return response()->json([
            'message' => 'Booking berhasil ditolak',
            'data' => $booking->load(['user', 'creator', 'editor', 'refunder', 'canceller', 'hotel', 'room', 'roomUnit'])
        ]);
    }

    // ✏️ UPDATE BOOKING (KHUSUS BOSS / SUPER ADMIN)
    public function updateBooking(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        $adminId = $request->input('edited_by');
        $admin = User::find($adminId);

        if (!$admin || !in_array($admin->role, ['super_admin', 'boss'])) {
            return response()->json([
                'message' => 'Anda tidak memiliki akses untuk mengedit booking'
            ], 403);
        }

        $request->validate([
            'guest_name' => 'required|string|max:255',
            'guest_phone' => 'required|string|max:50',
            'guest_email' => 'nullable|email|max:255',
            'check_in' => 'required|date',
            'room_unit_id' => 'required|exists:room_units,id',
            'discount_percent' => 'nullable|numeric|min:0|max:100',
            'admin_note' => 'nullable|string',
        ]);

        $roomUnit = RoomUnit::findOrFail($request->room_unit_id);

        if ((int) $roomUnit->room_id !== (int) $booking->room_id) {
            return response()->json([
                'message' => 'Kamar tidak sesuai tipe booking'
            ], 422);
        }

        if ((int) $roomUnit->status === 0) {
            return response()->json([
                'message' => 'Kamar fisik sedang tidak aktif / tidak tersedia'
            ], 422);
        }

        $checkIn = Carbon::parse($request->check_in);
        $checkOut = null;

        if ($booking->booking_type === 'transit') {
            $checkOut = (clone $checkIn)->addHours((int) $booking->duration_hours);
        } else {
            $durationDays = (int) ($booking->duration_days ?? 1);
            $checkOut = $this->calculateOvernightCheckOutByDays($checkIn, $durationDays);
        }

        if (
            !$this->isRoomUnitAvailable(
                $roomUnit->id,
                $checkIn,
                $checkOut,
                $booking->id
            )
        ) {
            return response()->json([
                'message' => 'Kamar bentrok dengan booking lain'
            ], 422);
        }

        $discountPercent = $request->filled('discount_percent')
            ? (float) $request->discount_percent
            : (float) ($booking->discount_percent ?? 0);

        $basePrice = (float) $booking->total_price;

        if ($discountPercent > 0) {
            $discountAmount = ($basePrice * $discountPercent) / 100;
            $finalPrice = max(0, round($basePrice - $discountAmount));
        } else {
            $finalPrice = $basePrice;
        }

        $booking->update([
            'guest_name' => $request->guest_name,
            'guest_phone' => $request->guest_phone,
            'guest_email' => $request->guest_email,
            'room_unit_id' => $roomUnit->id,
            'check_in' => $checkIn,
            'check_out' => $checkOut,
            'discount_percent' => $discountPercent,
            'total_price' => $finalPrice,
            'admin_note' => $request->admin_note,
            'edited_by' => $adminId,
        ]);

        return response()->json([
            'message' => 'Booking berhasil diupdate',
            'data' => $booking->load(['user', 'creator', 'editor', 'refunder', 'canceller', 'hotel', 'room', 'roomUnit'])
        ]);
    }

    // 💰 MARK AS PAID
    public function markPaid(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        $request->validate([
            'payment_method' => 'nullable|in:cash,transfer,qris',
            'paid_amount' => 'nullable|numeric|min:0',
            'payment_note' => 'nullable|string',
        ]);

        if ($booking->status !== 'confirmed') {
            return response()->json([
                'message' => 'Booking belum bisa dibayar. Status harus confirmed.'
            ], 422);
        }

        if ($booking->payment_status === 'paid') {
            return response()->json([
                'message' => 'Booking ini sudah dibayar sebelumnya'
            ], 422);
        }

        if ($booking->payment_status === 'refunded') {
            return response()->json([
                'message' => 'Booking ini sudah direfund'
            ], 422);
        }

        $paidAmount = $request->filled('paid_amount')
            ? (float) $request->paid_amount
            : (float) $booking->total_price;

        if ($paidAmount < 0) {
            return response()->json([
                'message' => 'Nominal pembayaran tidak valid'
            ], 422);
        }

        $booking->update([
            'payment_status' => 'paid',
            'payment_method' => $request->input('payment_method'),
            'paid_amount' => $paidAmount,
            'payment_note' => $request->input('payment_note'),
        ]);

        return response()->json([
            'message' => 'Pembayaran berhasil dikonfirmasi',
            'data' => $booking->load(['user', 'creator', 'editor', 'refunder', 'canceller', 'hotel', 'room', 'roomUnit'])
        ]);
    }

    // 💸 REFUND BOOKING (KHUSUS BOSS / SUPER ADMIN)
    public function refundBooking(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        $request->validate([
            'refunded_by' => 'required|exists:users,id',
            'refund_reason' => 'required|string',
            'refund_amount' => 'nullable|numeric|min:0',
        ]);

        $admin = User::find($request->refunded_by);

        if (!$admin || !in_array($admin->role, ['super_admin', 'boss'])) {
            return response()->json([
                'message' => 'Hanya boss atau super admin yang bisa melakukan refund'
            ], 403);
        }

        if ($booking->payment_status !== 'paid') {
            return response()->json([
                'message' => 'Refund hanya bisa dilakukan untuk booking yang sudah paid'
            ], 422);
        }

        $refundAmount = $request->filled('refund_amount')
            ? (float) $request->refund_amount
            : (float) $booking->total_price;

        if ($refundAmount > (float) $booking->total_price) {
            return response()->json([
                'message' => 'Nominal refund tidak boleh melebihi total harga booking'
            ], 422);
        }

        $booking->update([
            'payment_status' => 'refunded',
            'refund_amount' => $refundAmount,
            'refund_reason' => $request->refund_reason,
            'refunded_by' => $request->refunded_by,
            'refunded_at' => now(),
        ]);

        return response()->json([
            'message' => 'Refund berhasil diproses',
            'data' => $booking->load(['user', 'creator', 'editor', 'refunder', 'canceller', 'hotel', 'room', 'roomUnit'])
        ]);
    }

    // ❌ CANCEL BOOKING (BOSS / SUPER ADMIN / PENGAWAS / ADMIN, RECEPTIONIST TIDAK BISA)
    public function cancelBooking(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        $request->validate([
            'cancelled_by' => 'required|exists:users,id',
            'cancel_reason' => 'required|string',
        ]);

        $admin = User::find($request->cancelled_by);

        if (!$admin || !in_array($admin->role, ['boss', 'super_admin', 'pengawas', 'admin'])) {
            return response()->json([
                'message' => 'Hanya boss, super admin, pengawas, atau admin yang bisa melakukan cancel booking'
            ], 403);
        }

        if (in_array($booking->status, ['cancelled', 'completed'])) {
            return response()->json([
                'message' => 'Booking ini tidak bisa dicancel lagi'
            ], 422);
        }

        if ($booking->status === 'checked_out') {
            return response()->json([
                'message' => 'Booking yang sudah check-out tidak bisa dicancel'
            ], 422);
        }

        if ($booking->status === 'cleaning') {
            return response()->json([
                'message' => 'Booking yang sedang cleaning tidak bisa dicancel'
            ], 422);
        }

        $booking->update([
            'status' => 'cancelled',
            'cancel_reason' => $request->cancel_reason,
            'cancelled_by' => $request->cancelled_by,
            'cancelled_at' => now(),
        ]);

        return response()->json([
            'message' => 'Booking berhasil dicancel',
            'data' => $booking->load([
                'user',
                'creator',
                'editor',
                'refunder',
                'canceller',
                'hotel',
                'room',
                'roomUnit'
            ])
        ]);
    }

    /**
     * Hapus permanen booking dari database.
     *
     * Catatan penggunaan:
     * - Hanya boss dan super_admin.
     * - Dipakai untuk masa testing / sebelum launching.
     * - Booking akan hilang dari Booking List, Calendar, laporan, dan riwayat customer.
     * - Data denda/penalty terkait booking dihapus lebih dulu agar aman dari foreign key.
     */
    public function destroy(Request $request, $id)
    {
        $booking = Booking::with(['hotel', 'room', 'roomUnit'])->findOrFail($id);
        $actor = $this->resolveActorFromRequest($request);

        if (!$actor || !in_array($actor->role, ['boss', 'super_admin'])) {
            return response()->json([
                'message' => 'Hanya boss atau super admin yang bisa hapus booking'
            ], 403);
        }

        if (!$this->userCanAccessHotel($actor, $booking->hotel_id)) {
            return response()->json([
                'message' => 'Anda tidak memiliki akses ke cabang booking ini'
            ], 403);
        }

        $deletedBookingCode = $booking->booking_code;

        try {
            DB::transaction(function () use ($booking) {
                if (Schema::hasTable('booking_penalties')) {
                    DB::table('booking_penalties')
                        ->where('booking_id', $booking->id)
                        ->delete();
                }

                if (method_exists($booking, 'forceDelete')) {
                    $booking->forceDelete();
                    return;
                }

                $booking->delete();
            });
        } catch (\Throwable $error) {
            return response()->json([
                'message' => 'Booking gagal dihapus permanen. Cek relasi data booking di backend.',
                'error' => $error->getMessage(),
            ], 500);
        }

        return response()->json([
            'message' => 'Booking berhasil dihapus permanen',
            'data' => [
                'id' => (int) $id,
                'booking_code' => $deletedBookingCode,
                'deleted_by' => $actor->id,
                'delete_mode' => 'force',
            ],
        ]);
    }

    // 🟢 CHECK IN
    public function checkIn($id)
    {
        $booking = Booking::findOrFail($id);

        if ($booking->status !== 'confirmed') {
            return response()->json([
                'message' => 'Booking belum bisa check-in. Status harus confirmed.'
            ], 422);
        }

        if ($booking->payment_status !== 'paid') {
            return response()->json([
                'message' => 'Booking belum bisa check-in karena belum dibayar.'
            ], 422);
        }

        $booking->update([
            'status' => 'checked_in',
        ]);

        return response()->json([
            'message' => 'Tamu berhasil check-in',
            'data' => $booking->load(['user', 'creator', 'editor', 'refunder', 'canceller', 'hotel', 'room', 'roomUnit'])
        ]);
    }

    // 🔵 CHECK OUT
    public function checkOut(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        if ($booking->status !== 'checked_in') {
            return response()->json([
                'message' => 'Booking belum bisa check-out. Status harus checked_in.'
            ], 422);
        }

        $request->validate([
            'actual_check_out' => 'nullable|date',
            'checked_out_at' => 'nullable|date',
            'check_out_actual' => 'nullable|date',
            'checkout_at' => 'nullable|date',
        ]);

        $actualCheckOutValue =
            $request->input('actual_check_out')
            ?: $request->input('checked_out_at')
            ?: $request->input('check_out_actual')
            ?: $request->input('checkout_at')
            ?: now();

        $actualCheckOut = Carbon::parse($actualCheckOutValue);

        $updatePayload = $this->buildSafeBookingUpdate([
            'status' => 'checked_out',
            'actual_check_out' => $actualCheckOut,
            'checked_out_at' => $actualCheckOut,
            'check_out_actual' => $actualCheckOut,
            'checkout_at' => $actualCheckOut,
        ]);

        $booking->forceFill($updatePayload)->save();

        $booking = Booking::with([
            'user',
            'creator',
            'editor',
            'refunder',
            'canceller',
            'hotel',
            'room',
            'roomUnit',
            'penalties.creator',
        ])->findOrFail($booking->id);

        return response()->json([
            'message' => 'Tamu berhasil check-out',
            'data' => $this->appendCleaningMeta($booking)
        ]);
    }

    // 🧹 START CLEANING
    public function startCleaning(Request $request, $id)
    {
        $booking = Booking::with(['hotel', 'room', 'roomUnit'])->findOrFail($id);
        $actor = $this->resolveActorFromRequest($request);

        if ($actor && !$this->userCanAccessHotel($actor, $booking->hotel_id)) {
            return response()->json([
                'message' => 'Anda tidak memiliki akses ke cabang booking ini'
            ], 403);
        }

        if ($booking->status !== 'checked_out') {
            return response()->json([
                'message' => 'Cleaning belum bisa dimulai. Status harus checked_out.'
            ], 422);
        }

        $estimatedMinutes = (int) $request->input('cleaning_estimated_minutes', 15);
        $estimatedMinutes = max(5, min($estimatedMinutes, 180));

        $updatePayload = $this->buildSafeBookingUpdate([
            'status' => 'cleaning',
            'cleaning_started_by' => $actor?->id,
            'cleaning_started_at' => now(),
            'cleaning_finished_by' => null,
            'cleaning_finished_at' => null,
            'cleaning_estimated_minutes' => $estimatedMinutes,
        ]);

        $booking->forceFill($updatePayload)->save();

        $booking = Booking::with(['user', 'creator', 'editor', 'refunder', 'canceller', 'hotel', 'room', 'roomUnit'])
            ->findOrFail($booking->id);

        return response()->json([
            'message' => $actor
                ? 'Cleaning sedang ditangani oleh ' . $actor->name
                : 'Kamar masuk proses cleaning',
            'data' => $this->appendCleaningMeta($booking)
        ]);
    }

    // ✅ FINISH CLEANING / ROOM READY
    public function finishCleaning(Request $request, $id)
    {
        $booking = Booking::with(['hotel', 'room', 'roomUnit'])->findOrFail($id);
        $actor = $this->resolveActorFromRequest($request);

        if ($actor && !$this->userCanAccessHotel($actor, $booking->hotel_id)) {
            return response()->json([
                'message' => 'Anda tidak memiliki akses ke cabang booking ini'
            ], 403);
        }

        if ($booking->status !== 'cleaning') {
            return response()->json([
                'message' => 'Cleaning belum bisa diselesaikan. Status harus cleaning.'
            ], 422);
        }

        $updatePayload = $this->buildSafeBookingUpdate([
            'status' => 'completed',
            'cleaning_finished_by' => $actor?->id,
            'cleaning_finished_at' => now(),
        ]);

        $booking->forceFill($updatePayload)->save();

        $booking = Booking::with(['user', 'creator', 'editor', 'refunder', 'canceller', 'hotel', 'room', 'roomUnit'])
            ->findOrFail($booking->id);

        return response()->json([
            'message' => $actor
                ? 'Cleaning selesai oleh ' . $actor->name . ', kamar siap digunakan kembali'
                : 'Cleaning selesai, kamar siap digunakan kembali',
            'data' => $this->appendCleaningMeta($booking)
        ]);
    }

    // ✅ MANUAL BOOKING OLEH ADMIN / RESEPSIONIS
    public function storeManual(Request $request)
    {
        $request->validate([
            'guest_name' => 'required|string|max:255',
            'guest_phone' => 'required|string|max:50',
            'guest_email' => 'nullable|email|max:255',
            'created_by' => 'required|exists:users,id',
            'hotel_id' => 'required|exists:hotels,id',
            'room_id' => 'required|exists:rooms,id',
            'room_unit_id' => 'required|exists:room_units,id',
            'booking_type' => 'required|in:transit,overnight',
            'duration_hours' => 'nullable|integer|min:1',
            'duration_days' => 'nullable|integer|min:1',
            'check_in' => 'required|date',
            'check_out' => 'nullable|date|after:check_in',
            'discount_percent' => 'nullable|numeric|min:0|max:100',
            'total_price' => 'nullable|numeric|min:0',
            'admin_note' => 'nullable|string',
        ]);

        $room = Room::findOrFail($request->room_id);
        $roomUnit = RoomUnit::findOrFail($request->room_unit_id);
        $creator = User::with('hotels:id,name')->findOrFail($request->created_by);

        if (!$this->userCanAccessHotel($creator, $request->hotel_id)) {
            return response()->json([
                'message' => 'Anda tidak memiliki akses ke cabang hotel ini'
            ], 403);
        }

        if ((int) $roomUnit->room_id !== (int) $room->id) {
            return response()->json([
                'message' => 'Kamar fisik tidak sesuai dengan tipe kamar yang dipilih'
            ], 422);
        }

        if ((int) $room->hotel_id !== (int) $request->hotel_id) {
            return response()->json([
                'message' => 'Tipe kamar tidak sesuai dengan hotel yang dipilih'
            ], 422);
        }

        if ((int) $roomUnit->status === 0) {
            return response()->json([
                'message' => 'Kamar fisik sedang tidak aktif / tidak tersedia'
            ], 422);
        }

        $checkIn = Carbon::parse($request->check_in);
        $checkOut = null;
        $basePrice = 0;
        $durationDays = null;

        if ($request->booking_type === 'transit') {
            $durationHours = (int) $request->duration_hours;

            if (!in_array($durationHours, [3, 6, 12])) {
                return response()->json([
                    'message' => 'Durasi transit hanya boleh 3, 6, atau 12 jam'
                ], 422);
            }

            $checkOut = (clone $checkIn)->addHours($durationHours);

            if ($request->filled('total_price')) {
                $basePrice = (float) $request->total_price;
            } else {
                if ($durationHours === 3) {
                    $basePrice = (float) ($room->price_transit_3h ?? 0);
                } elseif ($durationHours === 6) {
                    $basePrice = (float) ($room->price_transit_6h ?? 0);
                } elseif ($durationHours === 12) {
                    $basePrice = (float) ($room->price_transit_12h ?? 0);
                }
            }
        } else {
            $durationDays = max(1, (int) ($request->duration_days ?? 1));

            if ($request->filled('check_out')) {
                $checkOut = Carbon::parse($request->check_out);

                $minimumCheckOut = $this->calculateOvernightCheckOutByDays($checkIn, 1);
                if ($checkOut->lt($minimumCheckOut)) {
                    return response()->json([
                        'message' => 'Check-out overnight tidak boleh kurang dari batas minimum aturan hotel'
                    ], 422);
                }
            } else {
                $checkOut = $this->calculateOvernightCheckOutByDays($checkIn, $durationDays);
            }

            if ($request->filled('total_price')) {
                $basePrice = (float) $request->total_price;
            } else {
                $basePrice = (float) ($room->price_per_night ?? 0) * $durationDays;
            }
        }

        if (!$this->isRoomUnitAvailable($roomUnit->id, $checkIn, $checkOut)) {
            return response()->json([
                'message' => 'Kamar tidak tersedia pada jam tersebut karena bentrok dengan booking lain'
            ], 422);
        }

        $discountPercent = 0;
        if ($request->filled('discount_percent')) {
            if (!in_array($creator->role, ['super_admin', 'boss'])) {
                return response()->json([
                    'message' => 'Hanya boss atau super admin yang boleh memberi discount'
                ], 403);
            }

            $discountPercent = (float) $request->discount_percent;
        }

        $discountAmount = $discountPercent > 0
            ? ($basePrice * $discountPercent) / 100
            : 0;

        $finalPrice = max(0, round($basePrice - $discountAmount));

        $booking = Booking::create([
            'booking_code' => $this->generateBookingCode(),
            'user_id' => null,
            'guest_name' => $request->guest_name,
            'guest_phone' => $request->guest_phone,
            'guest_email' => $request->guest_email,
            'booking_source' => 'admin_manual',
            'created_by' => $request->created_by,

            'hotel_id' => $request->hotel_id,
            'room_id' => $request->room_id,
            'room_unit_id' => $request->room_unit_id,

            'booking_type' => $request->booking_type,
            'duration_hours' => $request->booking_type === 'transit'
                ? $request->duration_hours
                : null,
            'duration_days' => $request->booking_type === 'overnight'
                ? $durationDays
                : null,

            'check_in' => $checkIn,
            'check_out' => $checkOut,
            'discount_percent' => $discountPercent,
            'total_price' => $finalPrice,

            'status' => 'confirmed',
            'payment_status' => 'unpaid',

            'admin_note' => $request->admin_note,
            'rejection_reason_internal' => null,
            'rejection_reason_customer' => null,
        ]);

        return response()->json([
            'message' => 'Booking manual berhasil dibuat',
            'data' => $booking->load(['user', 'creator', 'editor', 'refunder', 'canceller', 'hotel', 'room', 'roomUnit'])
        ], 201);
    }
}