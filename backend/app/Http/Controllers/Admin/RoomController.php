<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\Room;
use App\Models\RoomImage;
use App\Models\Facility;

class RoomController extends Controller
{
    /**
     * GET rooms (ADMIN)
     */
    public function index()
    {
        $rooms = Room::with(['hotel.city', 'hotel.facilities', 'images', 'units'])
            ->orderByDesc('id')
            ->get();

        $this->attachRoomFacilitiesToRooms($rooms);

        return response()->json($rooms);
    }

    /**
     * GET all active rooms (PUBLIC - customer)
     * Hanya kamar aktif dari hotel aktif.
     */
    public function publicIndex()
    {
        $rooms = Room::with(['hotel.city', 'hotel.facilities', 'images'])
            ->where('status', true)
            ->whereHas('hotel', function ($query) {
                $query->where('status', true);
            })
            ->orderByDesc('id')
            ->get();

        $this->attachRoomFacilitiesToRooms($rooms);

        return response()->json([
            'message' => 'All active rooms fetched successfully',
            'data' => $rooms,
        ]);
    }

    /**
     * GET rooms by hotel (PUBLIC - customer)
     *
     * Penting:
     * - Tetap hanya tampilkan room dari hotel yang aktif.
     * - Room dengan status nonaktif tetap dikirim ke frontend HotelDetail.jsx
     *   supaya bisa tampil gelap / disabled, bukan hilang total.
     */
    public function getByHotel($hotelId)
    {
        $rooms = Room::with(['hotel.city', 'hotel.facilities', 'images'])
            ->where('hotel_id', $hotelId)
            ->whereHas('hotel', function ($query) {
                $query->where('status', true);
            })
            ->orderByDesc('status')
            ->orderBy('name')
            ->get();

        $this->attachRoomFacilitiesToRooms($rooms);

        return response()->json([
            'message' => 'Rooms by hotel fetched successfully',
            'data' => $rooms,
        ]);
    }

    /**
     * GET single room detail (PUBLIC - customer)
     */
    public function showPublic($id)
    {
        $room = Room::with(['hotel.city', 'hotel.facilities', 'images'])
            ->where('status', true)
            ->whereHas('hotel', function ($query) {
                $query->where('status', true);
            })
            ->findOrFail($id);

        $this->attachRoomFacilitiesToRoom($room);

        return response()->json([
            'message' => 'Room detail fetched successfully',
            'data' => $room,
        ]);
    }

    /**
     * GET form data (optional)
     */
    public function create()
    {
        return response()->json([
            'message' => 'Create room endpoint',
        ]);
    }

    /**
     * POST create room
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'hotel_id' => 'required|exists:hotels,id',
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:100',
            'capacity' => 'required|integer|min:1',
            'price_per_night' => 'required|numeric|min:0',

            // Field utama yang dipakai backend sekarang.
            'price_transit_3h' => 'nullable|numeric|min:0',
            'price_transit_6h' => 'nullable|numeric|min:0',
            'price_transit_12h' => 'nullable|numeric|min:0',

            // Tetap support field lama / alternatif dari frontend.
            'price_3h' => 'nullable|numeric|min:0',
            'price_6h' => 'nullable|numeric|min:0',
            'price_12h' => 'nullable|numeric|min:0',

            'total_rooms' => 'required|integer|min:1',
            'description' => 'nullable|string',
            'status' => 'required|boolean',

            /*
             * Nomor kamar fisik dari AddRoom.jsx.
             * Ini diterima agar request Add Kamar aman.
             * Pembuatan room unit tetap dilakukan frontend lewat /admin/room-units
             * supaya tidak double input.
             */
            'room_numbers' => 'nullable|array',
            'room_numbers.*' => 'nullable|string|max:50',

            /*
             * Fasilitas kamar.
             * Dibuat fleksibel supaya aman dengan beberapa kemungkinan nama field frontend:
             * - room_facility_ids[]
             * - room_facilities[]
             * - facility_ids[]
             * - facilities[]
             */
            'room_facility_ids' => 'nullable|array',
            'room_facility_ids.*' => 'nullable',
            'room_facilities' => 'nullable|array',
            'room_facilities.*' => 'nullable',
            'facility_ids' => 'nullable|array',
            'facility_ids.*' => 'nullable',
            'facilities' => 'nullable|array',
            'facilities.*' => 'nullable',

            // Cover room. thumbnail = nama field utama, cover/cover_image = alias aman.
            'thumbnail' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'cover' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'cover_image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',

            // Gallery room. images = nama field utama, gallery/gallery_images = alias aman.
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpg,jpeg,png,webp|max:4096',
            'gallery' => 'nullable|array',
            'gallery.*' => 'image|mimes:jpg,jpeg,png,webp|max:4096',
            'gallery_images' => 'nullable|array',
            'gallery_images.*' => 'image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        $thumbnailPath = $this->storeFirstAvailableCover($request);

        $room = Room::create([
            'hotel_id' => $validated['hotel_id'],
            'name' => $validated['name'],
            'type' => $validated['type'],
            'capacity' => $validated['capacity'],
            'price_per_night' => $validated['price_per_night'],
            'price_transit_3h' => $request->input('price_transit_3h', $request->input('price_3h', 0)),
            'price_transit_6h' => $request->input('price_transit_6h', $request->input('price_6h', 0)),
            'price_transit_12h' => $request->input('price_transit_12h', $request->input('price_12h', 0)),
            'total_rooms' => $validated['total_rooms'],
            'available_rooms' => $validated['total_rooms'],
            'description' => $request->input('description'),
            'thumbnail' => $thumbnailPath,
            'status' => $request->boolean('status'),
        ]);

        $this->syncRoomFacilities($room, $this->getRoomFacilityIdsFromRequest($request));
        $this->storeGalleryImages($request, $room);

        $freshRoom = $room->fresh()->load(['hotel.city', 'hotel.facilities', 'images', 'units']);
        $this->attachRoomFacilitiesToRoom($freshRoom);

        return response()->json([
            'message' => 'Kamar berhasil ditambahkan',

            // Tambahan aman supaya frontend lebih mudah membaca ID room baru.
            'room_id' => $freshRoom->id,
            'room' => $freshRoom,

            // Data lama tetap dipertahankan agar code yang sudah jalan tidak rusak.
            'data' => $freshRoom,
        ], 201);
    }

    /**
     * PUT / POST update room (ADMIN)
     *
     * Aman untuk:
     * - request JSON biasa,
     * - multipart/form-data dari modal edit,
     * - POST dengan _method=PUT dari frontend.
     */
    public function update(Request $request, $id)
    {
        $room = Room::with(['images'])->findOrFail($id);

        $validated = $request->validate([
            'hotel_id' => 'required|exists:hotels,id',
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:100',
            'capacity' => 'required|integer|min:1',
            'price_per_night' => 'required|numeric|min:0',

            // Support nama field lama dan baru dari frontend.
            'price_transit_3h' => 'nullable|numeric|min:0',
            'price_transit_6h' => 'nullable|numeric|min:0',
            'price_transit_12h' => 'nullable|numeric|min:0',
            'price_3h' => 'nullable|numeric|min:0',
            'price_6h' => 'nullable|numeric|min:0',
            'price_12h' => 'nullable|numeric|min:0',

            'total_rooms' => 'required|integer|min:1',
            'description' => 'nullable|string',
            'status' => 'required|boolean',

            // Opsional aman jika nanti frontend edit room mengirim field ini.
            'room_numbers' => 'nullable|array',
            'room_numbers.*' => 'nullable|string|max:50',

            /*
             * Fasilitas kamar.
             * Kalau field ini dikirim saat update, backend akan sinkron ulang fasilitas kamar.
             * Kalau tidak dikirim, fasilitas lama tetap aman.
             */
            'room_facility_ids' => 'nullable|array',
            'room_facility_ids.*' => 'nullable',
            'room_facilities' => 'nullable|array',
            'room_facilities.*' => 'nullable',
            'facility_ids' => 'nullable|array',
            'facility_ids.*' => 'nullable',
            'facilities' => 'nullable|array',
            'facilities.*' => 'nullable',

            // Cover room. thumbnail = nama field utama, cover/cover_image = alias aman.
            'thumbnail' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'cover' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'cover_image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',

            // Gallery room. images = nama field utama, gallery/gallery_images = alias aman.
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpg,jpeg,png,webp|max:4096',
            'gallery' => 'nullable|array',
            'gallery.*' => 'image|mimes:jpg,jpeg,png,webp|max:4096',
            'gallery_images' => 'nullable|array',
            'gallery_images.*' => 'image|mimes:jpg,jpeg,png,webp|max:4096',

            // Opsional: kalau nanti frontend mau hapus foto gallery satu-satu.
            'delete_image_ids' => 'nullable|array',
            'delete_image_ids.*' => 'integer|exists:room_images,id',

            // Opsional: kalau nanti frontend mau replace semua gallery lama.
            'replace_gallery' => 'nullable|boolean',
        ]);

        $oldTotalRooms = (int) ($room->total_rooms ?? 0);
        $oldAvailableRooms = (int) ($room->available_rooms ?? $oldTotalRooms);
        $newTotalRooms = (int) $validated['total_rooms'];

        $availableRooms = $this->calculateAvailableRooms(
            $oldTotalRooms,
            $oldAvailableRooms,
            $newTotalRooms
        );

        $thumbnailPath = $room->thumbnail;

        if ($this->hasAnyCoverFile($request)) {
            $this->deleteStorageFile($room->thumbnail);
            $thumbnailPath = $this->storeFirstAvailableCover($request);
        }

        $room->update([
            'hotel_id' => $validated['hotel_id'],
            'name' => $validated['name'],
            'type' => $validated['type'],
            'capacity' => $validated['capacity'],
            'price_per_night' => $validated['price_per_night'],
            'price_transit_3h' => $request->input('price_transit_3h', $request->input('price_3h', 0)),
            'price_transit_6h' => $request->input('price_transit_6h', $request->input('price_6h', 0)),
            'price_transit_12h' => $request->input('price_transit_12h', $request->input('price_12h', 0)),
            'total_rooms' => $newTotalRooms,
            'available_rooms' => $availableRooms,
            'description' => $request->input('description'),
            'thumbnail' => $thumbnailPath,
            'status' => $request->boolean('status'),
        ]);

        if ($this->requestHasRoomFacilityPayload($request)) {
            $this->syncRoomFacilities($room, $this->getRoomFacilityIdsFromRequest($request));
        }

        if ($request->boolean('replace_gallery')) {
            $this->deleteAllGalleryImages($room);
        }

        if ($request->filled('delete_image_ids')) {
            $this->deleteSelectedGalleryImages($room, $request->input('delete_image_ids', []));
        }

        $this->storeGalleryImages($request, $room);

        $freshRoom = $room->fresh()->load(['hotel.city', 'hotel.facilities', 'images', 'units']);
        $this->attachRoomFacilitiesToRoom($freshRoom);

        return response()->json([
            'message' => 'Kamar berhasil diperbarui',
            'data' => $freshRoom,
        ]);
    }

    /**
     * DELETE room (ADMIN)
     */
    public function destroy($id)
    {
        $room = Room::with(['images'])->findOrFail($id);

        $this->deleteStorageFile($room->thumbnail);

        foreach ($room->images as $image) {
            $this->deleteStorageFile($image->image_path);
            $image->delete();
        }

        $this->clearRoomFacilities($room);

        $room->delete();

        return response()->json([
            'message' => 'Kamar berhasil dihapus',
        ]);
    }

    /**
     * Hitung ulang available_rooms saat total_rooms berubah.
     * Logic lama dipertahankan: perubahan total menambah/mengurangi available secara proporsional.
     */
    private function calculateAvailableRooms(int $oldTotalRooms, int $oldAvailableRooms, int $newTotalRooms): int
    {
        $availableRooms = $oldAvailableRooms;

        if ($newTotalRooms !== $oldTotalRooms) {
            $difference = $newTotalRooms - $oldTotalRooms;
            $availableRooms = max(0, $oldAvailableRooms + $difference);
            $availableRooms = min($availableRooms, $newTotalRooms);
        }

        return $availableRooms;
    }

    /**
     * Cek cover file dari beberapa kemungkinan nama field.
     */
    private function hasAnyCoverFile(Request $request): bool
    {
        return $request->hasFile('thumbnail')
            || $request->hasFile('cover')
            || $request->hasFile('cover_image');
    }

    /**
     * Simpan cover pertama yang tersedia.
     * Urutan utama tetap thumbnail supaya cocok dengan code lama.
     */
    private function storeFirstAvailableCover(Request $request): ?string
    {
        foreach (['thumbnail', 'cover', 'cover_image'] as $field) {
            if ($request->hasFile($field)) {
                return $request->file($field)->store('rooms', 'public');
            }
        }

        return null;
    }

    /**
     * Ambil semua gallery file dari beberapa kemungkinan nama field.
     */
    private function getGalleryFiles(Request $request): array
    {
        foreach (['images', 'gallery', 'gallery_images'] as $field) {
            if ($request->hasFile($field)) {
                $files = $request->file($field);

                return is_array($files) ? $files : [$files];
            }
        }

        return [];
    }

    /**
     * Simpan gallery tambahan tanpa menghapus gallery lama.
     */
    private function storeGalleryImages(Request $request, Room $room): void
    {
        $galleryFiles = $this->getGalleryFiles($request);

        if (empty($galleryFiles)) {
            return;
        }

        $lastSortOrder = (int) RoomImage::where('room_id', $room->id)->max('sort_order');

        foreach ($galleryFiles as $index => $image) {
            $imagePath = $image->store('rooms/gallery', 'public');

            RoomImage::create([
                'room_id' => $room->id,
                'image_path' => $imagePath,
                'sort_order' => $lastSortOrder + $index + 1,
            ]);
        }
    }

    /**
     * Hapus file dari storage public kalau ada.
     */
    private function deleteStorageFile(?string $path): void
    {
        if ($path && Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    /**
     * Hapus semua gallery lama milik room.
     */
    private function deleteAllGalleryImages(Room $room): void
    {
        $room->loadMissing('images');

        foreach ($room->images as $image) {
            $this->deleteStorageFile($image->image_path);
            $image->delete();
        }
    }

    /**
     * Hapus beberapa gallery berdasarkan ID.
     * Tetap dibatasi room_id supaya tidak bisa hapus gambar room lain.
     */
    private function deleteSelectedGalleryImages(Room $room, array $imageIds): void
    {
        if (empty($imageIds)) {
            return;
        }

        $images = RoomImage::where('room_id', $room->id)
            ->whereIn('id', $imageIds)
            ->get();

        foreach ($images as $image) {
            $this->deleteStorageFile($image->image_path);
            $image->delete();
        }
    }

    /**
     * Cek apakah request membawa payload fasilitas kamar.
     * Supaya update lama yang tidak kirim fasilitas tidak menghapus fasilitas yang sudah tersimpan.
     */
    private function requestHasRoomFacilityPayload(Request $request): bool
    {
        return $request->has('room_facility_ids')
            || $request->has('room_facilities')
            || $request->has('facility_ids')
            || $request->has('facilities');
    }

    /**
     * Ambil IDs fasilitas kamar dari request dengan beberapa nama field yang mungkin.
     */
    private function getRoomFacilityIdsFromRequest(Request $request): array
    {
        $fields = [
            'room_facility_ids',
            'room_facilities',
            'facility_ids',
            'facilities',
        ];

        $rawValues = [];

        foreach ($fields as $field) {
            if (!$request->has($field)) {
                continue;
            }

            $value = $request->input($field, []);

            if (!is_array($value)) {
                $value = [$value];
            }

            $rawValues = array_merge($rawValues, $value);
        }

        $ids = [];

        foreach ($rawValues as $item) {
            if (is_array($item)) {
                $candidate = $item['id'] ?? $item['facility_id'] ?? null;
            } else {
                $candidate = $item;
            }

            if (is_numeric($candidate) && (int) $candidate > 0) {
                $ids[] = (int) $candidate;
            }
        }

        $ids = array_values(array_unique($ids));

        return $this->filterRoomFacilityIds($ids);
    }

    /**
     * Filter fasilitas khusus kamar supaya fasilitas hotel tidak ikut masuk ke detail kamar.
     * Tetap support data lama kalau kolom usage_scope belum ada.
     */
    private function filterRoomFacilityIds(array $ids): array
    {
        if (empty($ids)) {
            return [];
        }

        $query = Facility::whereIn('id', $ids);

        if (Schema::hasColumn('facilities', 'usage_scope')) {
            $query->where(function ($scopeQuery) {
                $scopeQuery
                    ->where('usage_scope', 'room')
                    ->orWhere('usage_scope', 'kamar')
                    ->orWhere('usage_scope', 'both')
                    ->orWhere('usage_scope', 'all')
                    ->orWhere('usage_scope', 'semua')
                    ->orWhereNull('usage_scope')
                    ->orWhere('usage_scope', '');
            });
        }

        return $query->pluck('id')->map(function ($id) {
            return (int) $id;
        })->values()->toArray();
    }

    /**
     * Deteksi nama table pivot room-facility.
     * Dibuat fleksibel supaya tidak merusak kalau nama table kamu berbeda.
     */
    private function roomFacilityPivotTable(): ?string
    {
        $candidates = [
            'facility_room',
            'room_facility',
            'room_facilities',
        ];

        foreach ($candidates as $table) {
            if (
                Schema::hasTable($table) &&
                Schema::hasColumn($table, 'room_id') &&
                Schema::hasColumn($table, 'facility_id')
            ) {
                return $table;
            }
        }

        return null;
    }

    /**
     * Sinkron fasilitas kamar ke pivot table.
     * Kalau pivot belum ada, function ini tidak akan bikin error.
     */
    private function syncRoomFacilities(Room $room, array $facilityIds): void
    {
        $table = $this->roomFacilityPivotTable();

        if (!$table) {
            return;
        }

        DB::table($table)
            ->where('room_id', $room->id)
            ->delete();

        if (empty($facilityIds)) {
            return;
        }

        $now = now();

        $hasCreatedAt = Schema::hasColumn($table, 'created_at');
        $hasUpdatedAt = Schema::hasColumn($table, 'updated_at');

        $rows = [];

        foreach ($facilityIds as $facilityId) {
            $row = [
                'room_id' => $room->id,
                'facility_id' => $facilityId,
            ];

            if ($hasCreatedAt) {
                $row['created_at'] = $now;
            }

            if ($hasUpdatedAt) {
                $row['updated_at'] = $now;
            }

            $rows[] = $row;
        }

        DB::table($table)->insert($rows);
    }

    /**
     * Hapus pivot fasilitas saat room dihapus.
     */
    private function clearRoomFacilities(Room $room): void
    {
        $table = $this->roomFacilityPivotTable();

        if (!$table) {
            return;
        }

        DB::table($table)
            ->where('room_id', $room->id)
            ->delete();
    }

    /**
     * Ambil fasilitas kamar dari pivot.
     */
    private function getRoomFacilities(Room $room)
    {
        $table = $this->roomFacilityPivotTable();

        if (!$table) {
            return collect([]);
        }

        $facilityIds = DB::table($table)
            ->where('room_id', $room->id)
            ->pluck('facility_id')
            ->map(function ($id) {
                return (int) $id;
            })
            ->unique()
            ->values()
            ->toArray();

        if (empty($facilityIds)) {
            return collect([]);
        }

        $query = Facility::whereIn('id', $facilityIds)
            ->where(function ($statusQuery) {
                $statusQuery
                    ->where('status', true)
                    ->orWhere('status', 1);
            });

        if (Schema::hasColumn('facilities', 'usage_scope')) {
            $query->where(function ($scopeQuery) {
                $scopeQuery
                    ->where('usage_scope', 'room')
                    ->orWhere('usage_scope', 'kamar')
                    ->orWhere('usage_scope', 'both')
                    ->orWhere('usage_scope', 'all')
                    ->orWhere('usage_scope', 'semua')
                    ->orWhereNull('usage_scope')
                    ->orWhere('usage_scope', '');
            });
        }

        return $query->orderBy('name')->get();
    }

    /**
     * Tempelkan fasilitas kamar ke object room supaya frontend bisa baca:
     * - room.room_facilities
     * - room.room_facility_ids
     * - room.facilities
     */
    private function attachRoomFacilitiesToRoom(Room $room): Room
    {
        $roomFacilities = $this->getRoomFacilities($room)->values();

        $room->setAttribute('room_facilities', $roomFacilities);
        $room->setAttribute('room_facility_ids', $roomFacilities->pluck('id')->values());

        /*
         * Ini sengaja ikut dikirim supaya RoomDetail.jsx yang baca room.facilities
         * juga langsung dapat fasilitas kamar, bukan fasilitas hotel.
         */
        $room->setAttribute('facilities', $roomFacilities);

        return $room;
    }

    /**
     * Tempelkan fasilitas kamar ke banyak room.
     */
    private function attachRoomFacilitiesToRooms($rooms): void
    {
        foreach ($rooms as $room) {
            $this->attachRoomFacilitiesToRoom($room);
        }
    }
}