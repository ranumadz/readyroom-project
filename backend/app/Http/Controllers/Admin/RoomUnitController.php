<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use App\Models\RoomUnit;
use App\Models\Booking;

class RoomUnitController extends Controller
{
    public function indexByRoom($roomId)
    {
        $units = RoomUnit::where('room_id', $roomId)
            ->orderByRaw('LENGTH(room_number), room_number')
            ->get()
            ->map(function ($unit) {
                $activeBooking = $this->findActiveBookingForUnit($unit->id);

                return $this->formatUnitResponse($unit, $activeBooking);
            });

        return response()->json($units);
    }

    public function store(Request $request)
    {
        $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'room_number' => 'required|string|max:50',
            'status' => 'required|boolean',
        ]);

        $exists = RoomUnit::where('room_id', $request->room_id)
            ->where('room_number', $request->room_number)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Nomor kamar sudah ada untuk tipe kamar ini',
            ], 422);
        }

        $unit = new RoomUnit();
        $unit->room_id = $request->room_id;
        $unit->room_number = $request->room_number;
        $unit->status = $request->boolean('status');

        if (Schema::hasColumn('room_units', 'operational_status')) {
            $unit->operational_status = $request->boolean('status')
                ? 'available'
                : 'inactive';
        }

        if (Schema::hasColumn('room_units', 'is_maintenance')) {
            $unit->is_maintenance = false;
        }

        if (Schema::hasColumn('room_units', 'is_cleaning')) {
            $unit->is_cleaning = false;
        }

        if (Schema::hasColumn('room_units', 'reason')) {
            $unit->reason = null;
        }

        $unit->save();

        return response()->json([
            'message' => 'Kamar fisik berhasil ditambahkan',
            'data' => $this->formatUnitResponse($unit->fresh()),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $unit = RoomUnit::findOrFail($id);

        $request->validate([
            'room_number' => 'nullable|string|max:50',
            'status' => 'required',
            'reason' => 'nullable|string|max:500',
            'inactive_reason' => 'nullable|string|max:500',
            'maintenance_reason' => 'nullable|string|max:500',
            'is_maintenance' => 'nullable|boolean',
            'is_cleaning' => 'nullable|boolean',
        ]);

        if ($request->filled('room_number')) {
            $exists = RoomUnit::where('room_id', $unit->room_id)
                ->where('room_number', $request->room_number)
                ->where('id', '!=', $unit->id)
                ->exists();

            if ($exists) {
                return response()->json([
                    'message' => 'Nomor kamar sudah ada untuk tipe kamar ini',
                ], 422);
            }

            $unit->room_number = $request->room_number;
        }

        $operationalStatus = $this->detectOperationalStatus($request);
        $reason = $request->input(
            'reason',
            $request->input('inactive_reason', $request->input('maintenance_reason', ''))
        );

        /*
         * Kolom status lama tetap dipertahankan:
         * true  = kamar boleh dipakai
         * false = kamar tidak boleh dipakai
         */
        $unit->status = $operationalStatus === 'available';

        /*
         * Kolom monitoring tambahan.
         * Semua dicek dulu agar aman kalau ada environment yang belum migrate.
         */
        if (Schema::hasColumn('room_units', 'operational_status')) {
            $unit->operational_status = $operationalStatus;
        }

        if (Schema::hasColumn('room_units', 'reason')) {
            $unit->reason = $operationalStatus === 'available' ? null : $reason;
        }

        if (Schema::hasColumn('room_units', 'inactive_reason')) {
            $unit->inactive_reason = $operationalStatus === 'inactive' ? $reason : null;
        }

        if (Schema::hasColumn('room_units', 'maintenance_reason')) {
            $unit->maintenance_reason = $operationalStatus === 'maintenance' ? $reason : null;
        }

        if (Schema::hasColumn('room_units', 'is_maintenance')) {
            $unit->is_maintenance = $operationalStatus === 'maintenance';
        }

        if (Schema::hasColumn('room_units', 'is_cleaning')) {
            $unit->is_cleaning = $operationalStatus === 'cleaning';
        }

        $unit->save();

        return response()->json([
            'message' => 'Status kamar berhasil diperbarui',
            'data' => $this->formatUnitResponse($unit->fresh()),
        ]);
    }

    private function detectOperationalStatus(Request $request)
    {
        $status = strtolower((string) $request->input('status'));

        if (
            $status === 'maintenance' ||
            $status === 'rusak' ||
            $request->boolean('is_maintenance')
        ) {
            return 'maintenance';
        }

        if (
            $status === 'cleaning' ||
            $status === 'dirty' ||
            $request->boolean('is_cleaning')
        ) {
            return 'cleaning';
        }

        if (
            $status === '0' ||
            $status === 'false' ||
            $status === 'inactive' ||
            $status === 'nonaktif'
        ) {
            return 'inactive';
        }

        return 'available';
    }

    private function formatUnitResponse(RoomUnit $unit, $activeBooking = null)
    {
        $data = $unit->toArray();

        $manualStatus = $this->getManualUnitStatus($unit);
        $bookingStatus = $this->getBookingUnitStatus($activeBooking);

        /*
         * Urutan status:
         * 1. Kalau ada booking aktif/check-in => occupied.
         * 2. Kalau booking sudah checkout/start cleaning => cleaning.
         * 3. Kalau tidak ada booking aktif, pakai status manual dari room_units.
         */
        $monitoringStatus = $bookingStatus ?: $manualStatus;

        $reason = $this->getManualReason($unit);

        $data['manual_status'] = $manualStatus;
        $data['monitoring_status'] = $monitoringStatus;
        $data['is_maintenance'] = $monitoringStatus === 'maintenance';
        $data['is_cleaning'] = $monitoringStatus === 'cleaning';
        $data['reason'] = $reason;

        if ($activeBooking) {
            $data['current_booking'] = $this->formatBookingSummary($activeBooking);
            $data['booking_active'] = $bookingStatus === 'occupied';
        } else {
            $data['current_booking'] = null;
            $data['booking_active'] = false;
        }

        return $data;
    }

    private function getManualUnitStatus(RoomUnit $unit)
    {
        if (Schema::hasColumn('room_units', 'operational_status') && !empty($unit->operational_status)) {
            return strtolower((string) $unit->operational_status);
        }

        if (Schema::hasColumn('room_units', 'is_maintenance') && $unit->is_maintenance) {
            return 'maintenance';
        }

        if (Schema::hasColumn('room_units', 'is_cleaning') && $unit->is_cleaning) {
            return 'cleaning';
        }

        if (!$unit->status) {
            return 'inactive';
        }

        return 'available';
    }

    private function getManualReason(RoomUnit $unit)
    {
        if (Schema::hasColumn('room_units', 'reason') && !empty($unit->reason)) {
            return $unit->reason;
        }

        if (Schema::hasColumn('room_units', 'inactive_reason') && !empty($unit->inactive_reason)) {
            return $unit->inactive_reason;
        }

        if (Schema::hasColumn('room_units', 'maintenance_reason') && !empty($unit->maintenance_reason)) {
            return $unit->maintenance_reason;
        }

        return '';
    }

    private function findActiveBookingForUnit($roomUnitId)
    {
        if (!Schema::hasTable('bookings')) {
            return null;
        }

        if (!Schema::hasColumn('bookings', 'room_unit_id')) {
            return null;
        }

        $statusColumn = Schema::hasColumn('bookings', 'status') ? 'status' : null;

        $query = Booking::query()
            ->where('room_unit_id', $roomUnitId);

        /*
         * Status yang masih memengaruhi monitoring kamar:
         * - confirmed/approved/paid/checked_in => merah/occupied
         * - checked_out/cleaning/start_cleaning => kuning/cleaning
         *
         * Status final/cancel tidak ikut supaya setelah checkout selesai/finished
         * kamar bisa kembali available otomatis.
         */
        if ($statusColumn) {
            $query->whereIn($statusColumn, [
                'confirmed',
                'approve',
                'approved',
                'paid',
                'checked_in',
                'check_in',
                'checkin',
                'checked-out',
                'checked_out',
                'check_out',
                'checkout',
                'cleaning',
                'start_cleaning',
                'in_cleaning',
            ]);
        }

        $checkOutColumn = $this->getFirstExistingBookingColumn([
            'check_out',
            'checkout',
            'check_out_at',
            'checkout_at',
            'end_time',
            'end_at',
        ]);

        /*
         * Kalau ada check_out, buang booking lama yang sudah sangat lewat,
         * kecuali statusnya memang belum difinalkan.
         * Buffer 2 hari dibuat aman untuk flow hotel yang belum selalu klik finish.
         */
        if ($checkOutColumn) {
            $query->where(function ($innerQuery) use ($checkOutColumn) {
                $innerQuery
                    ->whereNull($checkOutColumn)
                    ->orWhere($checkOutColumn, '>=', now()->subDays(2));
            });
        }

        $orderColumn = $this->getFirstExistingBookingColumn([
            'check_in',
            'checkin',
            'check_in_at',
            'checkin_at',
            'start_time',
            'start_at',
            'created_at',
        ]);

        if ($orderColumn) {
            $query->orderByDesc($orderColumn);
        } else {
            $query->orderByDesc('id');
        }

        return $query->first();
    }

    private function getBookingUnitStatus($booking)
    {
        if (!$booking) {
            return null;
        }

        $status = strtolower((string) ($booking->status ?? ''));

        if (in_array($status, [
            'checked-out',
            'checked_out',
            'check_out',
            'checkout',
            'cleaning',
            'start_cleaning',
            'in_cleaning',
        ], true)) {
            return 'cleaning';
        }

        if (in_array($status, [
            'confirmed',
            'approve',
            'approved',
            'paid',
            'checked_in',
            'check_in',
            'checkin',
        ], true)) {
            return 'occupied';
        }

        return 'occupied';
    }

    private function formatBookingSummary($booking)
    {
        if (!$booking) {
            return null;
        }

        return [
            'id' => $booking->id ?? null,
            'booking_code' => $booking->booking_code ?? $booking->code ?? null,
            'status' => $booking->status ?? null,
            'customer_name' => $booking->customer_name
                ?? $booking->guest_name
                ?? optional($booking->customer ?? null)->name
                ?? null,
            'check_in' => $booking->check_in
                ?? $booking->checkin
                ?? $booking->check_in_at
                ?? $booking->checkin_at
                ?? null,
            'check_out' => $booking->check_out
                ?? $booking->checkout
                ?? $booking->check_out_at
                ?? $booking->checkout_at
                ?? null,
        ];
    }

    private function getFirstExistingBookingColumn(array $columns)
    {
        foreach ($columns as $column) {
            if (Schema::hasColumn('bookings', $column)) {
                return $column;
            }
        }

        return null;
    }
}
