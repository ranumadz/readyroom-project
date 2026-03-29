<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\Room;
use Carbon\Carbon;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:customers,id',
        ]);

        $bookings = Booking::with([
            'hotel',
            'room',
            'roomUnit',
        ])
            ->where('user_id', $request->user_id)
            ->latest()
            ->get();

        return response()->json([
            'message' => 'Riwayat booking berhasil diambil',
            'data' => $bookings,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:customers,id',
            'hotel_id' => 'required|exists:hotels,id',
            'room_id' => 'required|exists:rooms,id',
            'booking_type' => 'required|in:transit,overnight',
            'duration_hours' => 'nullable|integer|min:1',
            'check_in' => 'required|date',
        ]);

        $room = Room::with('hotel')->findOrFail($request->room_id);

        if ((int) $room->hotel_id !== (int) $request->hotel_id) {
            return response()->json([
                'message' => 'Kamar tidak sesuai dengan hotel yang dipilih'
            ], 422);
        }

        if (!(bool) $room->status) {
            return response()->json([
                'message' => 'Kamar sedang tidak aktif atau tidak tersedia untuk booking'
            ], 422);
        }

        $checkIn = Carbon::parse($request->check_in);
        $checkOut = null;
        $totalPrice = 0;

        if ($request->booking_type === 'transit') {
            $durationHours = (int) $request->duration_hours;

            if (!in_array($durationHours, [3, 6, 12])) {
                return response()->json([
                    'message' => 'Durasi transit hanya boleh 3, 6, atau 12 jam'
                ], 422);
            }

            $checkOut = (clone $checkIn)->addHours($durationHours);

            if ($durationHours === 3) {
                $totalPrice = $room->price_transit_3h ?? 0;
            } elseif ($durationHours === 6) {
                $totalPrice = $room->price_transit_6h ?? 0;
            } elseif ($durationHours === 12) {
                $totalPrice = $room->price_transit_12h ?? 0;
            }
        } else {
            $checkOut = $this->calculateOvernightCheckOut($checkIn);
            $totalPrice = $room->price_per_night ?? 0;
        }

        $bookingCode = $this->generateBookingCode();

        $booking = Booking::create([
            'booking_code' => $bookingCode,
            'user_id' => $request->user_id,
            'hotel_id' => $request->hotel_id,
            'room_id' => $request->room_id,
            'room_unit_id' => null,
            'booking_type' => $request->booking_type,
            'duration_hours' => $request->booking_type === 'transit'
                ? $request->duration_hours
                : null,
            'check_in' => $checkIn,
            'check_out' => $checkOut,
            'total_price' => $totalPrice,
            'status' => 'pending',
            'payment_status' => 'unpaid',
            'admin_note' => null,
            'rejection_reason_internal' => null,
            'rejection_reason_customer' => null,
        ]);

        return response()->json([
            'message' => 'Booking berhasil dibuat dan menunggu persetujuan admin',
            'data' => $booking->load(['hotel', 'room'])
        ], 201);
    }

    private function calculateOvernightCheckOut(Carbon $checkIn): Carbon
    {
        $checkOut = (clone $checkIn)->setTime(12, 0, 0);

        // Jika check-in jam 12 siang atau setelahnya,
        // maka checkout overnight adalah besok jam 12 siang
        if ($checkIn->greaterThanOrEqualTo((clone $checkIn)->setTime(12, 0, 0))) {
            $checkOut->addDay();
        }

        return $checkOut;
    }

    private function generateBookingCode()
    {
        $date = now()->format('Ymd');
        $lastBooking = Booking::latest('id')->first();

        $nextNumber = $lastBooking ? $lastBooking->id + 1 : 1;

        return 'RR-' . $date . '-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }
}