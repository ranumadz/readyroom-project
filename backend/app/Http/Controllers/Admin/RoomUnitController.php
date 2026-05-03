<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use App\Models\RoomUnit;

class RoomUnitController extends Controller
{
    public function indexByRoom($roomId)
    {
        $units = RoomUnit::where('room_id', $roomId)
            ->orderByRaw('LENGTH(room_number), room_number')
            ->get()
            ->map(function ($unit) {
                return $this->formatUnitResponse($unit);
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
         * Kolom status lama tetap dipertahankan.
         * true  = kamar boleh dipakai
         * false = kamar tidak boleh dipakai
         */
        $unit->status = $operationalStatus === 'available';

        /*
         * Kolom tambahan ini aman:
         * kalau kolom belum ada di database, tidak akan dipaksa disimpan.
         * Jadi code lama tetap aman.
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

    private function formatUnitResponse(RoomUnit $unit)
    {
        $data = $unit->toArray();

        $operationalStatus = 'available';

        if (Schema::hasColumn('room_units', 'operational_status') && !empty($unit->operational_status)) {
            $operationalStatus = $unit->operational_status;
        } elseif (Schema::hasColumn('room_units', 'is_maintenance') && $unit->is_maintenance) {
            $operationalStatus = 'maintenance';
        } elseif (Schema::hasColumn('room_units', 'is_cleaning') && $unit->is_cleaning) {
            $operationalStatus = 'cleaning';
        } elseif (!$unit->status) {
            $operationalStatus = 'inactive';
        }

        $reason = '';

        if (Schema::hasColumn('room_units', 'reason') && !empty($unit->reason)) {
            $reason = $unit->reason;
        } elseif (Schema::hasColumn('room_units', 'inactive_reason') && !empty($unit->inactive_reason)) {
            $reason = $unit->inactive_reason;
        } elseif (Schema::hasColumn('room_units', 'maintenance_reason') && !empty($unit->maintenance_reason)) {
            $reason = $unit->maintenance_reason;
        }

        $data['monitoring_status'] = $operationalStatus;
        $data['is_maintenance'] = $operationalStatus === 'maintenance';
        $data['is_cleaning'] = $operationalStatus === 'cleaning';
        $data['reason'] = $reason;

        return $data;
    }
}