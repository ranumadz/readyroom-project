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

class BookingController extends Controller
{
    public function index()
    {
        $bookings = Booking::with([
            'user',
            'creator',
            'editor',
            'refunder',
            'hotel',
            'room',
            'roomUnit'
        ])->latest()->get();

        return response()->json($bookings);
    }

    public function calendar(Request $request)
    {
        $hotelId = $request->query('hotel_id');
        $month = (int) $request->query('month', now()->month);
        $year = (int) $request->query('year', now()->year);

        $startDate = Carbon::create($year, $month, 1)->startOfMonth();
        $endDate = Carbon::create($year, $month, 1)->endOfMonth();

        $hotels = Hotel::select('id', 'name')
            ->orderBy('name')
            ->get();

        $roomUnitsQuery = RoomUnit::with([
            'room:id,hotel_id,name',
        ])
            ->whereHas('room', function ($query) use ($hotelId) {
                if ($hotelId) {
                    $query->where('hotel_id', $hotelId);
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
            'hotel:id,name',
            'room:id,hotel_id,name',
            'roomUnit:id,room_id,room_number',
        ])
            ->whereNotNull('room_unit_id')
            ->where(function ($query) use ($startDate, $endDate) {
                $query->where('check_in', '<=', $endDate)
                    ->where('check_out', '>=', $startDate);
            });

        if ($hotelId) {
            $bookingsQuery->where('hotel_id', $hotelId);
        }

        $bookings = $bookingsQuery
            ->orderBy('check_in')
            ->get()
            ->map(function ($booking) {
                return [
                    'id' => $booking->id,
                    'booking_code' => $booking->booking_code,
                    'guest_name' => $booking->guest_name,
                    'guest_phone' => $booking->guest_phone,
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

        // room unit harus milik room yang sama
        if ((int) $roomUnit->room_id !== (int) $booking->room_id) {
            return response()->json([
                'message' => 'Kamar fisik tidak sesuai dengan tipe kamar booking ini'
            ], 422);
        }

        // status operasional room unit harus aktif
        if ((int) $roomUnit->status === 0) {
            return response()->json([
                'message' => 'Kamar fisik sedang tidak aktif / tidak tersedia'
            ], 422);
        }

        // cek bentrok waktu
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
            'data' => $booking->load(['user', 'creator', 'editor', 'refunder', 'hotel', 'room', 'roomUnit'])
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
            'data' => $booking->load(['user', 'creator', 'editor', 'refunder', 'hotel', 'room', 'roomUnit'])
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

        // cek room unit sesuai room booking
        if ((int) $roomUnit->room_id !== (int) $booking->room_id) {
            return response()->json([
                'message' => 'Kamar tidak sesuai tipe booking'
            ], 422);
        }

        // room unit harus aktif
        if ((int) $roomUnit->status === 0) {
            return response()->json([
                'message' => 'Kamar fisik sedang tidak aktif / tidak tersedia'
            ], 422);
        }

        $checkIn = Carbon::parse($request->check_in);
        $checkOut = null;

        if ($booking->booking_type === 'transit') {
            $checkOut = (clone $checkIn)->addHours($booking->duration_hours);
        } else {
            $checkOut = (clone $checkIn)->addDay();
        }

        // cek bentrok waktu
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
            'data' => $booking->load(['user', 'creator', 'editor', 'refunder', 'hotel', 'room', 'roomUnit'])
        ]);
    }

    // 💰 MARK AS PAID
    public function markPaid($id)
    {
        $booking = Booking::findOrFail($id);

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

        $booking->update([
            'payment_status' => 'paid',
        ]);

        return response()->json([
            'message' => 'Pembayaran berhasil dikonfirmasi',
            'data' => $booking->load(['user', 'creator', 'editor', 'refunder', 'hotel', 'room', 'roomUnit'])
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
            'data' => $booking->load(['user', 'creator', 'editor', 'refunder', 'hotel', 'room', 'roomUnit'])
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
            'data' => $booking->load(['user', 'creator', 'editor', 'refunder', 'hotel', 'room', 'roomUnit'])
        ]);
    }

    // 🔵 CHECK OUT
    public function checkOut($id)
    {
        $booking = Booking::findOrFail($id);

        if ($booking->status !== 'checked_in') {
            return response()->json([
                'message' => 'Booking belum bisa check-out. Status harus checked_in.'
            ], 422);
        }

        $booking->update([
            'status' => 'checked_out',
        ]);

        return response()->json([
            'message' => 'Tamu berhasil check-out',
            'data' => $booking->load(['user', 'creator', 'editor', 'refunder', 'hotel', 'room', 'roomUnit'])
        ]);
    }

    // 🧹 START CLEANING
    public function startCleaning($id)
    {
        $booking = Booking::findOrFail($id);

        if ($booking->status !== 'checked_out') {
            return response()->json([
                'message' => 'Cleaning belum bisa dimulai. Status harus checked_out.'
            ], 422);
        }

        $booking->update([
            'status' => 'cleaning',
        ]);

        return response()->json([
            'message' => 'Kamar masuk proses cleaning',
            'data' => $booking->load(['user', 'creator', 'editor', 'refunder', 'hotel', 'room', 'roomUnit'])
        ]);
    }

    // ✅ FINISH CLEANING / ROOM READY
    public function finishCleaning($id)
    {
        $booking = Booking::findOrFail($id);

        if ($booking->status !== 'cleaning') {
            return response()->json([
                'message' => 'Cleaning belum bisa diselesaikan. Status harus cleaning.'
            ], 422);
        }

        $booking->update([
            'status' => 'completed',
        ]);

        return response()->json([
            'message' => 'Cleaning selesai, kamar siap digunakan kembali',
            'data' => $booking->load(['user', 'creator', 'editor', 'refunder', 'hotel', 'room', 'roomUnit'])
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
            'check_in' => 'required|date',
            'discount_percent' => 'nullable|numeric|min:0|max:100',
            'total_price' => 'nullable|numeric|min:0',
            'admin_note' => 'nullable|string',
        ]);

        $room = Room::findOrFail($request->room_id);
        $roomUnit = RoomUnit::findOrFail($request->room_unit_id);
        $creator = User::findOrFail($request->created_by);

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
            $checkOut = (clone $checkIn)->addDay();

            if ($request->filled('total_price')) {
                $basePrice = (float) $request->total_price;
            } else {
                $basePrice = (float) ($room->price_per_night ?? 0);
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
            'duration_hours' => $request->booking_type === 'transit' ? $request->duration_hours : null,

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
            'data' => $booking->load(['user', 'creator', 'editor', 'refunder', 'hotel', 'room', 'roomUnit'])
        ], 201);
    }
}