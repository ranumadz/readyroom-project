<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\QueryException;
use App\Models\RoomUnit;
use App\Models\Booking;

class RoomUnitController extends Controller
{
    private $bookingUserNameCache = [];

    public function indexByRoom($roomId)
    {
        $units = RoomUnit::where('room_id', $roomId)
            ->orderByRaw('LENGTH(room_number), room_number')
            ->get()
            ->map(function ($unit) {
                $activeBooking = $this->findActiveBookingForUnit($unit->id);

                /*
                 * Booking approved/paid/confirmed yang belum check-in
                 * hanya jadi label "Sudah Ada Booking",
                 * tidak membuat kamar merah.
                 *
                 * Sekarang dibuat banyak data supaya kamar yang punya beberapa
                 * booking di jam berbeda bisa tampil di modal frontend.
                 */
                $reservedBookings = $this->findReservedBookingsForUnit($unit->id);

                return $this->formatUnitResponse($unit, $activeBooking, $reservedBookings);
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

    public function destroy($id)
    {
        try {
            $unit = RoomUnit::findOrFail($id);

            /*
             * Hapus kamar fisik dibuat aman.
             * Walaupun monitoring hanya merah saat check-in,
             * data kamar tetap tidak boleh dihapus kalau masih punya booking belum final.
             */
            if ($this->hasBlockingBookingForDelete($unit->id)) {
                return response()->json([
                    'message' => 'Kamar ini masih terhubung dengan booking aktif atau booking yang belum selesai, tidak bisa dihapus. Gunakan Nonaktifkan saja agar riwayat tetap aman.',
                ], 422);
            }

            $manualStatus = $this->getManualUnitStatus($unit);

            if (in_array($manualStatus, ['occupied', 'booked', 'cleaning'], true)) {
                return response()->json([
                    'message' => 'Kamar yang sedang dipakai atau cleaning tidak bisa dihapus.',
                ], 422);
            }

            $roomNumber = $unit->room_number;

            $unit->delete();

            return response()->json([
                'message' => 'Kamar fisik berhasil dihapus.',
                'deleted_room_number' => $roomNumber,
            ]);
        } catch (QueryException $error) {
            return response()->json([
                'message' => 'Kamar ini tidak bisa dihapus karena masih terhubung dengan data booking. Gunakan Nonaktifkan saja agar riwayat tetap aman.',
            ], 422);
        }
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

    private function formatUnitResponse(RoomUnit $unit, $activeBooking = null, $reservedBookings = null)
    {
        $data = $unit->toArray();

        $manualStatus = $this->getManualUnitStatus($unit);
        $bookingStatus = $this->getBookingUnitStatus($activeBooking);

        /*
         * Konsep monitoring kamar:
         * 1. Booking baru approved/confirmed/paid TIDAK bikin kamar merah.
         * 2. Kamar merah hanya saat tamu benar-benar check-in.
         * 3. Setelah check-out/start cleaning, kamar kuning cleaning.
         * 4. Kalau tidak ada status operasional booking, pakai status manual room_units.
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

        /*
         * Booking mendatang / booking yang sudah di-approve tapi belum check-in.
         * Ini dipakai frontend untuk:
         * - tampil 1 booking utama di card
         * - tombol +1 Booking Lagi
         * - modal semua booking kamar tersebut
         */
        if ($reservedBookings === null) {
            $reservedBookings = $this->findReservedBookingsForUnit($unit->id);
        }

        if ($reservedBookings instanceof \Illuminate\Support\Collection) {
            $reservedBookings = $reservedBookings->all();
        }

        if (!is_array($reservedBookings)) {
            $reservedBookings = $reservedBookings ? [$reservedBookings] : [];
        }

        $reservedSummaries = collect($reservedBookings)
            ->filter()
            ->map(function ($booking) {
                return $this->formatBookingSummary($booking);
            })
            ->filter()
            ->values()
            ->all();

        $firstReserved = $reservedSummaries[0] ?? null;

        /*
         * Backward compatible:
         * Frontend lama masih bisa baca reserved_booking,
         * frontend baru bisa baca reserved_bookings.
         */
        $data['reserved_booking'] = $firstReserved;
        $data['upcoming_booking'] = $firstReserved;
        $data['next_booking'] = $firstReserved;

        $data['reserved_bookings'] = $reservedSummaries;
        $data['upcoming_bookings'] = $reservedSummaries;
        $data['next_bookings'] = $reservedSummaries;

        $data['has_reserved_booking'] = count($reservedSummaries) > 0;
        $data['reserved_booking_count'] = count($reservedSummaries);

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

        $query = $this->bookingQueryWithNameRelations()
            ->where('room_unit_id', $roomUnitId);

        /*
         * PENTING:
         * Status approved/confirmed/paid tidak dimasukkan di sini.
         * Karena booking yang baru disetujui admin belum berarti kamar sudah diduduki.
         *
         * Monitoring kamar hanya dipengaruhi oleh:
         * - checked_in/check_in/checkin => merah/occupied
         * - checked_out/check_out/cleaning/start_cleaning => kuning/cleaning
         */
        if ($statusColumn) {
            $query->whereIn($statusColumn, [
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
         * Kalau ada check_out, buang booking lama yang sudah sangat lewat.
         * Buffer 2 hari dibuat aman untuk flow hotel yang belum selalu klik finish cleaning.
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

    private function findReservedBookingForUnit($roomUnitId)
    {
        return $this->findReservedBookingsForUnit($roomUnitId)->first();
    }

    private function findReservedBookingsForUnit($roomUnitId)
    {
        if (!Schema::hasTable('bookings')) {
            return collect();
        }

        if (!Schema::hasColumn('bookings', 'room_unit_id')) {
            return collect();
        }

        if (!Schema::hasColumn('bookings', 'status')) {
            return collect();
        }

        $query = $this->bookingQueryWithNameRelations()
            ->where('room_unit_id', $roomUnitId)
            ->whereIn('status', [
                'confirmed',
                'approve',
                'approved',
                'paid',
                'booked',
                'reserved',
            ]);

        /*
         * Kalau booking punya waktu checkout/end,
         * booking yang sudah lewat tidak perlu ditampilkan sebagai label.
         */
        $checkOutColumn = $this->getFirstExistingBookingColumn([
            'check_out',
            'checkout',
            'check_out_at',
            'checkout_at',
            'end_time',
            'end_at',
        ]);

        if ($checkOutColumn) {
            $query->where(function ($innerQuery) use ($checkOutColumn) {
                $innerQuery
                    ->whereNull($checkOutColumn)
                    ->orWhere($checkOutColumn, '>=', now()->subHours(2));
            });
        }

        /*
         * Tampilkan booking terdekat dulu supaya admin tahu urutan jadwal kamar.
         */
        $checkInColumn = $this->getFirstExistingBookingColumn([
            'check_in',
            'checkin',
            'check_in_at',
            'checkin_at',
            'start_time',
            'start_at',
        ]);

        if ($checkInColumn) {
            $query->orderBy($checkInColumn);
        } else {
            $query->orderByDesc('id');
        }

        return $query->get();
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
            'checked_in',
            'check_in',
            'checkin',
        ], true)) {
            return 'occupied';
        }

        /*
         * confirmed / approve / approved / paid / pending
         * tidak membuat kamar merah di monitoring.
         */
        return null;
    }

    private function hasBlockingBookingForDelete($roomUnitId)
    {
        if (!Schema::hasTable('bookings')) {
            return false;
        }

        if (!Schema::hasColumn('bookings', 'room_unit_id')) {
            return false;
        }

        $query = Booking::query()
            ->where('room_unit_id', $roomUnitId);

        if (Schema::hasColumn('bookings', 'status')) {
            $query->whereNotIn('status', [
                'completed',
                'complete',
                'finished',
                'finish',
                'cancelled',
                'canceled',
                'rejected',
                'refund',
                'refunded',
                'expired',
            ]);
        }

        return $query->exists();
    }

    private function formatBookingSummary($booking)
    {
        if (!$booking) {
            return null;
        }

        $guestName = $this->getBookingPersonName($booking);

        return [
            'id' => $booking->id ?? null,
            'booking_code' => $booking->booking_code ?? $booking->code ?? null,
            'code' => $booking->code ?? $booking->booking_code ?? null,
            'status' => $booking->status ?? null,

            /*
             * Nama tamu dibuat lebih kuat:
             * - booking manual: customer_name / guest_name
             * - customer login: user.name dari user_id
             * - fallback: relasi customer / user kalau ada
             */
            'customer_name' => $guestName,
            'guest_name' => $guestName,
            'name' => $guestName,
            'user_name' => $guestName,

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

            'start_time' => $booking->start_time
                ?? $booking->start_at
                ?? $booking->check_in
                ?? $booking->checkin
                ?? $booking->check_in_at
                ?? $booking->checkin_at
                ?? null,

            'end_time' => $booking->end_time
                ?? $booking->end_at
                ?? $booking->check_out
                ?? $booking->checkout
                ?? $booking->check_out_at
                ?? $booking->checkout_at
                ?? null,

            /*
             * Data jenis booking untuk badge frontend:
             * Transit / Full Day.
             */
            'booking_type' => $booking->booking_type
                ?? $booking->type
                ?? $booking->stay_type
                ?? $booking->room_booking_type
                ?? $booking->duration_type
                ?? null,

            'type' => $booking->type
                ?? $booking->booking_type
                ?? $booking->stay_type
                ?? null,

            'stay_type' => $booking->stay_type
                ?? $booking->booking_type
                ?? $booking->type
                ?? null,

            'duration' => $booking->duration
                ?? $booking->duration_hours
                ?? $booking->hour_duration
                ?? $booking->day_duration
                ?? null,

            'duration_hours' => $booking->duration_hours
                ?? $booking->hour_duration
                ?? $booking->duration
                ?? null,

            'hours' => $booking->hours
                ?? $booking->duration_hours
                ?? $booking->hour_duration
                ?? null,
        ];
    }

    private function bookingQueryWithNameRelations()
    {
        $query = Booking::query();
        $relations = $this->getBookingNameRelations();

        if (!empty($relations)) {
            $query->with($relations);
        }

        return $query;
    }

    private function getBookingNameRelations()
    {
        $relations = [];
        $bookingModel = new Booking();

        if (method_exists($bookingModel, 'customer')) {
            $relations[] = 'customer';
        }

        if (method_exists($bookingModel, 'user')) {
            $relations[] = 'user';
        }

        return $relations;
    }

    private function getBookingPersonName($booking)
    {
        if (!$booking) {
            return null;
        }

        $candidates = [
            $booking->customer_name ?? null,
            $booking->guest_name ?? null,
            $booking->name ?? null,
            $booking->user_name ?? null,
            $booking->customer_full_name ?? null,
            $booking->guest_full_name ?? null,
        ];

        $customer = $this->safeGetBookingRelation($booking, 'customer');
        if ($customer) {
            $candidates[] = $customer->name ?? null;
            $candidates[] = $customer->full_name ?? null;
            $candidates[] = $customer->username ?? null;
            $candidates[] = $customer->email ?? null;
        }

        $user = $this->safeGetBookingRelation($booking, 'user');
        if ($user) {
            $candidates[] = $user->name ?? null;
            $candidates[] = $user->full_name ?? null;
            $candidates[] = $user->username ?? null;
            $candidates[] = $user->email ?? null;
        }

        if (!empty($booking->user_id)) {
            $candidates[] = $this->getUserNameById($booking->user_id);
        }

        foreach ($candidates as $candidate) {
            $name = trim((string) $candidate);

            if ($name !== '' && $name !== '-') {
                return $name;
            }
        }

        return null;
    }

    private function safeGetBookingRelation($booking, $relation)
    {
        if (!$booking || !method_exists($booking, $relation)) {
            return null;
        }

        try {
            if ($booking->relationLoaded($relation)) {
                return $booking->getRelation($relation);
            }

            return $booking->{$relation};
        } catch (\Throwable $error) {
            return null;
        }
    }

    private function getUserNameById($userId)
    {
        $userId = (int) $userId;

        if (!$userId) {
            return null;
        }

        if (array_key_exists($userId, $this->bookingUserNameCache)) {
            return $this->bookingUserNameCache[$userId];
        }

        if (!class_exists(\App\Models\User::class) || !Schema::hasTable('users')) {
            $this->bookingUserNameCache[$userId] = null;
            return null;
        }

        try {
            $user = \App\Models\User::find($userId);

            $name = $user?->name
                ?? $user?->full_name
                ?? $user?->username
                ?? $user?->email
                ?? null;

            $this->bookingUserNameCache[$userId] = $name;

            return $name;
        } catch (\Throwable $error) {
            $this->bookingUserNameCache[$userId] = null;
            return null;
        }
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