<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Facility;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\QueryException;

class FacilityController extends Controller
{
    public function index()
    {
        $facilities = Facility::orderBy('id', 'desc')
            ->get()
            ->map(function ($facility) {
                return $this->formatFacilityResponse($facility);
            });

        return response()->json([
            'message' => 'Data fasilitas berhasil diambil',
            'data' => $facilities,
        ], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:facilities,name',
            'icon' => 'nullable|string|max:255',
            'status' => 'nullable|boolean',

            // Sekarang kategori utama hanya:
            // hotel = fasilitas untuk hotel
            // room  = fasilitas untuk kamar
            'usage_scope' => 'nullable|string|max:50',
            'scope' => 'nullable|string|max:50',
            'facility_scope' => 'nullable|string|max:50',
            'facility_type' => 'nullable|string|max:50',
            'target' => 'nullable|string|max:50',
            'type_for' => 'nullable|string|max:50',
            'used_for' => 'nullable|string|max:50',
        ]);

        $facility = new Facility();
        $facility->name = $request->name;
        $facility->icon = $request->icon;
        $facility->status = $request->has('status')
            ? $request->boolean('status')
            : true;

        if ($this->hasUsageScopeColumn()) {
            $facility->usage_scope = $this->normalizeUsageScope($request, 'hotel');
        }

        $facility->save();

        return response()->json([
            'message' => 'Fasilitas berhasil ditambahkan',
            'data' => $this->formatFacilityResponse($facility->fresh()),
        ], 201);
    }

    public function show($id)
    {
        $facility = Facility::find($id);

        if (!$facility) {
            return response()->json([
                'message' => 'Fasilitas tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'message' => 'Detail fasilitas berhasil diambil',
            'data' => $this->formatFacilityResponse($facility),
        ], 200);
    }

    public function update(Request $request, $id)
    {
        $facility = Facility::find($id);

        if (!$facility) {
            return response()->json([
                'message' => 'Fasilitas tidak ditemukan',
            ], 404);
        }

        $request->validate([
            'name' => 'required|string|max:255|unique:facilities,name,' . $id,
            'icon' => 'nullable|string|max:255',
            'status' => 'nullable|boolean',

            // Sekarang kategori utama hanya hotel / room.
            'usage_scope' => 'nullable|string|max:50',
            'scope' => 'nullable|string|max:50',
            'facility_scope' => 'nullable|string|max:50',
            'facility_type' => 'nullable|string|max:50',
            'target' => 'nullable|string|max:50',
            'type_for' => 'nullable|string|max:50',
            'used_for' => 'nullable|string|max:50',
        ]);

        $facility->name = $request->name;
        $facility->icon = $request->icon;

        if ($request->has('status')) {
            $facility->status = $request->boolean('status');
        }

        if ($this->hasUsageScopeColumn()) {
            $facility->usage_scope = $this->normalizeUsageScope(
                $request,
                $facility->usage_scope ?? 'hotel'
            );
        }

        $facility->save();

        return response()->json([
            'message' => 'Fasilitas berhasil diperbarui',
            'data' => $this->formatFacilityResponse($facility->fresh()),
        ], 200);
    }

    public function destroy($id)
    {
        $facility = Facility::find($id);

        if (!$facility) {
            return response()->json([
                'message' => 'Fasilitas tidak ditemukan',
            ], 404);
        }

        if ($this->isFacilityBeingUsed($facility->id)) {
            return response()->json([
                'message' => 'Fasilitas ini masih dipakai di data hotel atau kamar. Untuk menjaga data tetap aman, nonaktifkan fasilitas saja.',
            ], 422);
        }

        try {
            $facility->delete();

            return response()->json([
                'message' => 'Fasilitas berhasil dihapus',
            ], 200);
        } catch (QueryException $error) {
            return response()->json([
                'message' => 'Fasilitas ini tidak bisa dihapus karena masih terhubung dengan data lain. Gunakan tombol nonaktifkan saja agar data tetap aman.',
            ], 422);
        }
    }

    private function hasUsageScopeColumn(): bool
    {
        return Schema::hasColumn('facilities', 'usage_scope');
    }

    private function normalizeUsageScope(Request $request, string $fallback = 'hotel'): string
    {
        $raw = $request->input(
            'usage_scope',
            $request->input(
                'scope',
                $request->input(
                    'facility_scope',
                    $request->input(
                        'facility_type',
                        $request->input(
                            'target',
                            $request->input(
                                'type_for',
                                $request->input('used_for', $fallback)
                            )
                        )
                    )
                )
            )
        );

        $value = strtolower(trim((string) $raw));

        if (in_array($value, ['room', 'rooms', 'kamar'], true)) {
            return 'room';
        }

        if (str_contains($value, 'room') || str_contains($value, 'kamar')) {
            return 'room';
        }

        /*
         * Data lama dari konsep sebelumnya:
         * all / both / semua / hotel & kamar
         * sekarang diarahkan ke hotel supaya UI tidak menampilkan kategori "Semua".
         */
        if (in_array($value, [
            'all',
            'both',
            'semua',
            'hotel_room',
            'hotel-room',
            'hotel & kamar',
            'hotel_kamar',
            'hotel-kamar',
        ], true)) {
            return 'hotel';
        }

        if (in_array($value, ['hotel', 'hotels'], true)) {
            return 'hotel';
        }

        if (str_contains($value, 'hotel')) {
            return 'hotel';
        }

        return in_array($fallback, ['hotel', 'room'], true)
            ? $fallback
            : 'hotel';
    }

    private function formatFacilityResponse(?Facility $facility)
    {
        if (!$facility) {
            return null;
        }

        $data = $facility->toArray();

        if (!array_key_exists('usage_scope', $data) || empty($data['usage_scope'])) {
            $data['usage_scope'] = 'hotel';
        }

        /*
         * Pastikan response juga tidak lagi mengirim "all" ke frontend.
         */
        $scope = strtolower((string) $data['usage_scope']);

        if (
            in_array($scope, ['all', 'both', 'semua', 'hotel_room', 'hotel-room', 'hotel & kamar'], true) ||
            (str_contains($scope, 'hotel') && (str_contains($scope, 'room') || str_contains($scope, 'kamar')))
        ) {
            $scope = 'hotel';
        }

        if (str_contains($scope, 'room') || str_contains($scope, 'kamar')) {
            $scope = 'room';
        }

        if (!in_array($scope, ['hotel', 'room'], true)) {
            $scope = 'hotel';
        }

        $data['usage_scope'] = $scope;
        $data['scope'] = $scope;
        $data['facility_scope'] = $scope;

        return $data;
    }

    private function isFacilityBeingUsed($facilityId): bool
    {
        /*
         * Cek beberapa kemungkinan nama tabel pivot.
         * Ini dibuat aman karena struktur project bisa beda-beda:
         * - facility_hotel / hotel_facility
         * - facility_room / room_facility
         * - hotel_facilities / room_facilities
         */
        $pivotTables = [
            'facility_hotel',
            'hotel_facility',
            'hotel_facilities',
            'facility_room',
            'room_facility',
            'room_facilities',
        ];

        foreach ($pivotTables as $table) {
            if (!Schema::hasTable($table)) {
                continue;
            }

            if (!Schema::hasColumn($table, 'facility_id')) {
                continue;
            }

            $exists = DB::table($table)
                ->where('facility_id', $facilityId)
                ->exists();

            if ($exists) {
                return true;
            }
        }

        return false;
    }
}