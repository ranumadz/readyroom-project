<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\Hotel;
use App\Models\Facility;
use App\Models\HotelImage;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;

class HotelController extends Controller
{
    private function validBookingStatuses(): array
    {
        return [
            'confirmed',
            'paid',
            'checked_in',
            'checked_out',
            'cleaning',
            'completed',
        ];
    }

    private function syncBookingClosureStatus(Hotel $hotel): Hotel
    {
        if (
            (bool) ($hotel->booking_is_closed ?? false) === true &&
            !empty($hotel->booking_reopen_at) &&
            now()->greaterThanOrEqualTo($hotel->booking_reopen_at)
        ) {
            $hotel->forceFill([
                'booking_is_closed' => false,
                'booking_closed_reason' => null,
                'booking_reopen_at' => null,
            ])->save();

            $hotel->booking_is_closed = false;
            $hotel->booking_closed_reason = null;
            $hotel->booking_reopen_at = null;
        }

        return $hotel;
    }

    private function getHotelStartingPrice(int $hotelId): array
    {
        $rooms = Room::where('hotel_id', $hotelId)
            ->where('status', true)
            ->get([
                'id',
                'hotel_id',
                'price_transit_3h',
                'price_transit_6h',
                'price_transit_12h',
                'price_per_night',
            ]);

        $priceOptions = [];

        foreach ($rooms as $room) {
            if ((float) ($room->price_transit_3h ?? 0) > 0) {
                $priceOptions[] = [
                    'price' => (float) $room->price_transit_3h,
                    'label' => '3 Jam',
                ];
            }

            if ((float) ($room->price_transit_6h ?? 0) > 0) {
                $priceOptions[] = [
                    'price' => (float) $room->price_transit_6h,
                    'label' => '6 Jam',
                ];
            }

            if ((float) ($room->price_transit_12h ?? 0) > 0) {
                $priceOptions[] = [
                    'price' => (float) $room->price_transit_12h,
                    'label' => '12 Jam',
                ];
            }

            if ((float) ($room->price_per_night ?? 0) > 0) {
                $priceOptions[] = [
                    'price' => (float) $room->price_per_night,
                    'label' => 'Full Day',
                ];
            }
        }

        if (count($priceOptions) === 0) {
            return [
                'price' => null,
                'label' => null,
            ];
        }

        usort($priceOptions, function ($a, $b) {
            return $a['price'] <=> $b['price'];
        });

        return [
            'price' => $priceOptions[0]['price'],
            'label' => $priceOptions[0]['label'],
        ];
    }

    private function attachStartingPrice($hotel)
    {
        $startingPrice = $this->getHotelStartingPrice((int) $hotel->id);

        $hotel->starting_price = $startingPrice['price'];
        $hotel->starting_price_label = $startingPrice['label'];

        // Alias supaya aman dengan frontend Hotels.jsx yang sudah dibuat.
        $hotel->lowest_price = $startingPrice['price'];
        $hotel->lowest_price_label = $startingPrice['label'];

        return $hotel;
    }

    /**
     * Cek apakah hotel masih punya data kamar.
     * Ini dipakai untuk mencegah hotel dihapus sembarangan dari admin.
     */
    private function hotelHasRooms(Hotel $hotel): bool
    {
        if (!Schema::hasTable('rooms') || !Schema::hasColumn('rooms', 'hotel_id')) {
            return false;
        }

        return DB::table('rooms')
            ->where('hotel_id', $hotel->id)
            ->exists();
    }

    /**
     * Cek apakah hotel sudah pernah masuk Booking List.
     * Dibuat fleksibel supaya aman untuk beberapa struktur booking:
     * - bookings.hotel_id
     * - bookings.room_id yang mengarah ke rooms.hotel_id
     * - bookings.room_unit_id yang mengarah ke room_units.room_id
     */
    private function hotelHasBookingHistory(Hotel $hotel): bool
    {
        if (!Schema::hasTable('bookings')) {
            return false;
        }

        if (Schema::hasColumn('bookings', 'hotel_id')) {
            $hasHotelBooking = DB::table('bookings')
                ->where('hotel_id', $hotel->id)
                ->exists();

            if ($hasHotelBooking) {
                return true;
            }
        }

        $roomIds = collect([]);

        if (Schema::hasTable('rooms') && Schema::hasColumn('rooms', 'hotel_id')) {
            $roomIds = DB::table('rooms')
                ->where('hotel_id', $hotel->id)
                ->pluck('id');
        }

        if ($roomIds->isNotEmpty() && Schema::hasColumn('bookings', 'room_id')) {
            $hasRoomBooking = DB::table('bookings')
                ->whereIn('room_id', $roomIds)
                ->exists();

            if ($hasRoomBooking) {
                return true;
            }
        }

        if (
            $roomIds->isNotEmpty() &&
            Schema::hasTable('room_units') &&
            Schema::hasColumn('room_units', 'room_id') &&
            Schema::hasColumn('bookings', 'room_unit_id')
        ) {
            $roomUnitIds = DB::table('room_units')
                ->whereIn('room_id', $roomIds)
                ->pluck('id');

            if ($roomUnitIds->isNotEmpty()) {
                return DB::table('bookings')
                    ->whereIn('room_unit_id', $roomUnitIds)
                    ->exists();
            }
        }

        return false;
    }

    /**
     * Data proteksi delete hotel untuk frontend HotelsList.jsx.
     * Hotel hanya boleh dihapus kalau benar-benar belum punya kamar dan belum punya riwayat booking.
     */
    private function getHotelDeleteProtection(Hotel $hotel): array
    {
        $hasRooms = $this->hotelHasRooms($hotel);
        $hasBookingHistory = $this->hotelHasBookingHistory($hotel);
        $canDelete = !$hasRooms && !$hasBookingHistory;

        $message = null;

        if ($hasBookingHistory) {
            $message = 'Hotel ini sudah memiliki riwayat booking, tidak bisa dihapus. Gunakan Nonaktifkan agar data booking, laporan, receipt, dan riwayat customer tetap aman.';
        } elseif ($hasRooms) {
            $message = 'Hotel ini masih memiliki data kamar, tidak bisa dihapus langsung. Hapus kamar yang salah input terlebih dahulu jika belum pernah booking, atau gunakan Nonaktifkan untuk hotel ini.';
        }

        return [
            'has_rooms' => $hasRooms,
            'has_booking_history' => $hasBookingHistory,
            'can_delete' => $canDelete,
            'delete_protection_message' => $message,
        ];
    }

    /**
     * Tempelkan info proteksi delete ke data hotel tanpa mengubah struktur lama.
     */
    private function attachDeleteProtectionToHotel(Hotel $hotel): Hotel
    {
        $protection = $this->getHotelDeleteProtection($hotel);

        $hotel->setAttribute('has_rooms', $protection['has_rooms']);
        $hotel->setAttribute('has_booking_history', $protection['has_booking_history']);
        $hotel->setAttribute('can_delete', $protection['can_delete']);
        $hotel->setAttribute('delete_protection_message', $protection['delete_protection_message']);

        return $hotel;
    }

    private function normalizeFacilityScope($facility): string
    {
        $raw = strtolower((string) (
            $facility->usage_scope ??
            $facility->scope ??
            $facility->facility_scope ??
            $facility->facility_type ??
            $facility->target ??
            $facility->type_for ??
            $facility->used_for ??
            'hotel'
        ));

        if (str_contains($raw, 'room') || str_contains($raw, 'kamar')) {
            return 'room';
        }

        return 'hotel';
    }

    private function hotelFacilities()
    {
        $query = Facility::where('status', true);

        if (Schema::hasColumn('facilities', 'usage_scope')) {
            $query->where(function ($facilityQuery) {
                $facilityQuery
                    ->whereNull('usage_scope')
                    ->orWhere('usage_scope', '')
                    ->orWhere('usage_scope', 'hotel')
                    ->orWhere('usage_scope', 'all')
                    ->orWhere('usage_scope', 'both')
                    ->orWhere('usage_scope', 'semua');
            });
        }

        return $query->orderBy('name')->get();
    }

    private function galleryFilesFromRequest(Request $request): array
    {
        if ($request->hasFile('gallery_images')) {
            return is_array($request->file('gallery_images'))
                ? $request->file('gallery_images')
                : [$request->file('gallery_images')];
        }

        // Alias cadangan, supaya aman kalau frontend lama/baru kirim key berbeda.
        if ($request->hasFile('images')) {
            return is_array($request->file('images'))
                ? $request->file('images')
                : [$request->file('images')];
        }

        return [];
    }

    private function storeGalleryImages(int $hotelId, array $images): void
    {
        foreach ($images as $image) {
            if (!$image) {
                continue;
            }

            $path = $image->store('hotels/gallery', 'public');

            HotelImage::create([
                'hotel_id' => $hotelId,
                'image' => $path,
            ]);
        }
    }

    private function deleteSelectedGalleryImages(Hotel $hotel, Request $request): void
    {
        $removeIds = $request->input('remove_gallery_image_ids', []);

        if (!is_array($removeIds) || count($removeIds) === 0) {
            return;
        }

        $images = HotelImage::where('hotel_id', $hotel->id)
            ->whereIn('id', $removeIds)
            ->get();

        foreach ($images as $image) {
            if ($image->image && Storage::disk('public')->exists($image->image)) {
                Storage::disk('public')->delete($image->image);
            }

            $image->delete();
        }
    }

    public function index()
    {
        $query = Hotel::with(['city', 'facilities', 'images'])
            ->latest();

        $this->applyAdminHotelAccessScope($query);

        $hotels = $query
            ->get()
            ->map(function ($hotel) {
                $hotel = $this->syncBookingClosureStatus($hotel);

                return $this->attachDeleteProtectionToHotel($hotel);
            });

        return response()->json($hotels);
    }

    public function publicIndex()
    {
        $validStatuses = $this->validBookingStatuses();

        $hotels = Hotel::with(['city', 'facilities', 'images'])
            ->withCount([
                'bookings as valid_booking_count' => function ($query) use ($validStatuses) {
                    $query->whereIn('status', $validStatuses);
                }
            ])
            ->where('status', true)
            ->orderByDesc('valid_booking_count')
            ->orderByDesc('id')
            ->get()
            ->map(function ($hotel) {
                $hotel = $this->syncBookingClosureStatus($hotel);

                return $this->attachStartingPrice($hotel);
            });

        return response()->json([
            'message' => 'Daftar hotel berhasil diambil',
            'data' => $hotels
        ]);
    }

    public function publicShow($id)
    {
        $validStatuses = $this->validBookingStatuses();

        $hotel = Hotel::with(['city', 'facilities', 'images'])
            ->withCount([
                'bookings as valid_booking_count' => function ($query) use ($validStatuses) {
                    $query->whereIn('status', $validStatuses);
                }
            ])
            ->where('status', true)
            ->findOrFail($id);

        $hotel = $this->syncBookingClosureStatus($hotel);
        $hotel = $this->attachStartingPrice($hotel);

        return response()->json([
            'message' => 'Detail hotel berhasil diambil',
            'data' => $hotel
        ]);
    }

    public function create()
    {
        $cities = City::where('status', true)
            ->orderBy('name')
            ->get();

        $facilities = $this->hotelFacilities();

        return response()->json([
            'cities' => $cities,
            'facilities' => $facilities,
        ]);
    }

    public function storeCity(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:cities,name',
            'status' => 'nullable|boolean',
        ]);

        $city = City::create([
            'name' => trim($validated['name']),
            'status' => $request->has('status') ? $request->boolean('status') : true,
        ]);

        return response()->json([
            'message' => 'Kota berhasil ditambahkan',
            'data' => $city
        ], 201);
    }


    public function destroyCity($id)
    {
        $city = City::findOrFail($id);

        /*
         * Kota tidak boleh dihapus kalau masih dipakai hotel/cabang.
         * Ini menjaga data hotel, booking, laporan, dan relasi lama tetap aman.
         */
        $hasHotels = Hotel::where('city_id', $city->id)->exists();

        if ($hasHotels) {
            return response()->json([
                'message' => 'Kota tidak bisa dihapus karena masih digunakan oleh hotel/cabang.',
            ], 422);
        }

        $cityName = $city->name;

        $city->delete();

        return response()->json([
            'message' => 'Kota berhasil dihapus.',
            'deleted_city' => $cityName,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'city_id' => 'required|exists:cities,id',
            'name' => 'required|string|max:255',
            'area' => 'nullable|string|max:255',
            'address' => 'required|string',
            'wa_admin' => 'nullable|string|max:30',
            'latitude' => 'nullable|string|max:50',
            'longitude' => 'nullable|string|max:50',
            'map_link' => 'nullable|string',
            'description' => 'nullable|string',
            'thumbnail' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:10240',
            'hero_image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:10240',
            'gallery_images' => 'nullable|array',
            'gallery_images.*' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:10240',
            'images' => 'nullable|array',
            'images.*' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:10240',
            'rating' => 'nullable|numeric|min:0|max:5',
            'status' => 'nullable|boolean',
            'facility_ids' => 'nullable|array',
            'facility_ids.*' => 'exists:facilities,id',
        ]);

        $thumbnailPath = null;
        $heroImagePath = null;

        if ($request->hasFile('thumbnail')) {
            $thumbnailPath = $request->file('thumbnail')->store('hotels/thumbnail', 'public');
        }

        if ($request->hasFile('hero_image')) {
            $heroImagePath = $request->file('hero_image')->store('hotels/hero', 'public');
        }

        $hotel = Hotel::create([
            'city_id' => $request->city_id,
            'name' => $request->name,
            'area' => $request->area ?? '',
            'address' => $request->address,
            'wa_admin' => $request->wa_admin,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'map_link' => $request->map_link,
            'description' => $request->description,
            'thumbnail' => $thumbnailPath,
            'hero_image' => $heroImagePath,
            'rating' => $request->rating ?? 0,
            'status' => $request->has('status') ? $request->boolean('status') : true,
        ]);

        $hotel->facilities()->sync($request->facility_ids ?? []);

        $this->storeGalleryImages($hotel->id, $this->galleryFilesFromRequest($request));

        $freshHotel = $hotel->load(['city', 'facilities', 'images']);
        $freshHotel = $this->attachDeleteProtectionToHotel($freshHotel);

        return response()->json([
            'message' => 'Hotel berhasil ditambahkan',
            'data' => $freshHotel
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $hotel = Hotel::with('images')->findOrFail($id);

        $request->validate([
            'city_id' => 'required|exists:cities,id',
            'name' => 'required|string|max:255',
            'area' => 'nullable|string|max:255',
            'address' => 'required|string',
            'wa_admin' => 'nullable|string|max:30',
            'latitude' => 'nullable|string|max:50',
            'longitude' => 'nullable|string|max:50',
            'map_link' => 'nullable|string',
            'description' => 'nullable|string',
            'thumbnail' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:10240',
            'hero_image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:10240',
            'gallery_images' => 'nullable|array',
            'gallery_images.*' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:10240',
            'images' => 'nullable|array',
            'images.*' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:10240',
            'remove_gallery_image_ids' => 'nullable|array',
            'remove_gallery_image_ids.*' => 'nullable|integer',
            'rating' => 'nullable|numeric|min:0|max:5',
            'status' => 'nullable|boolean',
            'facility_ids' => 'nullable|array',
            'facility_ids.*' => 'exists:facilities,id',
        ]);

        $data = [
            'city_id' => $request->city_id,
            'name' => $request->name,
            'area' => $request->area ?? ($hotel->area ?? ''),
            'address' => $request->address,
            'wa_admin' => $request->wa_admin,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'map_link' => $request->map_link,
            'description' => $request->description,
            'rating' => $request->rating ?? $hotel->rating,
            'status' => $request->has('status') ? $request->boolean('status') : $hotel->status,
        ];

        if ($request->hasFile('thumbnail')) {
            if ($hotel->thumbnail && Storage::disk('public')->exists($hotel->thumbnail)) {
                Storage::disk('public')->delete($hotel->thumbnail);
            }

            $data['thumbnail'] = $request->file('thumbnail')->store('hotels/thumbnail', 'public');
        }

        if ($request->hasFile('hero_image')) {
            if ($hotel->hero_image && Storage::disk('public')->exists($hotel->hero_image)) {
                Storage::disk('public')->delete($hotel->hero_image);
            }

            $data['hero_image'] = $request->file('hero_image')->store('hotels/hero', 'public');
        }

        $hotel->update($data);

        $hotel->facilities()->sync($request->facility_ids ?? []);

        /*
         * Penting:
         * Dulu saat update gallery, semua gallery lama dihapus lalu diganti.
         * Sekarang gallery baru ditambahkan saja supaya foto lama tidak hilang.
         */
        $this->deleteSelectedGalleryImages($hotel, $request);
        $this->storeGalleryImages($hotel->id, $this->galleryFilesFromRequest($request));

        $freshHotel = $hotel->fresh()->load(['city', 'facilities', 'images']);
        $freshHotel = $this->attachDeleteProtectionToHotel($freshHotel);

        return response()->json([
            'message' => 'Hotel berhasil diupdate',
            'data' => $freshHotel
        ]);
    }

    public function closeBooking(Request $request, $id)
    {
        $hotel = Hotel::findOrFail($id);

        $validated = $request->validate([
            'booking_closed_reason' => 'nullable|string|max:255',
            'booking_reopen_at' => 'required|date|after:now',
        ]);

        $hotel->update([
            'booking_is_closed' => true,
            'booking_closed_reason' => $validated['booking_closed_reason'] ?? 'Kamar penuh',
            'booking_reopen_at' => $validated['booking_reopen_at'],
        ]);

        return response()->json([
            'message' => 'Booking hotel berhasil ditutup sementara',
            'data' => $hotel->fresh()->load(['city', 'facilities', 'images']),
        ]);
    }

    public function openBooking($id)
    {
        $hotel = Hotel::findOrFail($id);

        $hotel->update([
            'booking_is_closed' => false,
            'booking_closed_reason' => null,
            'booking_reopen_at' => null,
        ]);

        return response()->json([
            'message' => 'Booking hotel berhasil dibuka kembali',
            'data' => $hotel->fresh()->load(['city', 'facilities', 'images']),
        ]);
    }

    public function destroy($id)
    {
        $hotel = Hotel::with('images')->findOrFail($id);
        $deleteProtection = $this->getHotelDeleteProtection($hotel);

        if (!$deleteProtection['can_delete']) {
            return response()->json([
                'message' => $deleteProtection['delete_protection_message']
                    ?: 'Hotel ini tidak bisa dihapus karena masih memiliki data kamar atau riwayat booking. Gunakan Nonaktifkan agar data tetap aman.',
                'has_rooms' => $deleteProtection['has_rooms'],
                'has_booking_history' => $deleteProtection['has_booking_history'],
                'can_delete' => false,
            ], 409);
        }

        if ($hotel->thumbnail && Storage::disk('public')->exists($hotel->thumbnail)) {
            Storage::disk('public')->delete($hotel->thumbnail);
        }

        if ($hotel->hero_image && Storage::disk('public')->exists($hotel->hero_image)) {
            Storage::disk('public')->delete($hotel->hero_image);
        }

        foreach ($hotel->images as $image) {
            if ($image->image && Storage::disk('public')->exists($image->image)) {
                Storage::disk('public')->delete($image->image);
            }
        }

        $hotel->images()->delete();
        $hotel->delete();

        return response()->json([
            'message' => 'Hotel berhasil dihapus'
        ]);
    }

    /**
     * Scope cabang untuk endpoint admin /admin/hotels.
     * Ini yang dipakai dropdown cabang di Monitoring Kamar dan Ketersediaan Booking.
     */
    private function applyAdminHotelAccessScope($query): void
    {
        $user = Auth::user();

        if (!$user) {
            return;
        }

        $role = strtolower((string) ($user->role ?? ''));

        if ($this->roleCanAccessAllHotels($role)) {
            return;
        }

        if (!$this->roleNeedsHotelScope($role)) {
            return;
        }

        $hotelIds = $this->getUserAccessibleHotelIds($user);

        if (empty($hotelIds)) {
            $query->whereRaw('1 = 0');
            return;
        }

        $query->whereIn('id', $hotelIds);
    }

    private function roleCanAccessAllHotels(string $role): bool
    {
        return in_array($role, ['boss', 'super_admin', 'it'], true);
    }

    private function roleNeedsHotelScope(string $role): bool
    {
        return in_array($role, ['admin', 'pengawas'], true);
    }

    private function getUserAccessibleHotelIds($user): array
    {
        if (!$user) {
            return [];
        }

        $ids = [];

        $ids = array_merge($ids, $this->getHotelIdsFromUserRelation($user));
        $ids = array_merge($ids, $this->getHotelIdsFromUserAttributes($user));
        $ids = array_merge($ids, $this->getHotelIdsFromPivotTables($user));

        return collect($ids)
            ->map(function ($id) {
                return (int) $id;
            })
            ->filter(function ($id) {
                return $id > 0;
            })
            ->unique()
            ->values()
            ->all();
    }

    private function getHotelIdsFromUserRelation($user): array
    {
        $ids = [];

        $relationNames = [
            'hotels',
            'branches',
            'cabangs',
            'assignedHotels',
            'accessibleHotels',
            'hotelAccesses',
            'branchAccesses',
        ];

        foreach ($relationNames as $relationName) {
            try {
                if (!method_exists($user, $relationName)) {
                    continue;
                }

                $relation = $user->{$relationName}();

                try {
                    $ids = array_merge($ids, $relation->pluck('hotels.id')->toArray());
                    continue;
                } catch (\Throwable $error) {
                    // lanjut fallback
                }

                try {
                    $ids = array_merge($ids, $relation->pluck('id')->toArray());
                    continue;
                } catch (\Throwable $error) {
                    // lanjut fallback
                }

                try {
                    $ids = array_merge($ids, $relation->pluck('hotel_id')->toArray());
                } catch (\Throwable $error) {
                    // abaikan relasi yang struktur kolomnya beda
                }
            } catch (\Throwable $error) {
                // abaikan agar endpoint tetap aman
            }
        }

        foreach ($relationNames as $relationName) {
            try {
                $loadedData = $user->{$relationName} ?? null;

                if ($loadedData instanceof \Illuminate\Support\Collection) {
                    foreach ($loadedData as $item) {
                        $ids[] = $item->id ?? $item->hotel_id ?? $item->branch_id ?? $item->cabang_id ?? null;
                    }
                }

                if (is_array($loadedData)) {
                    foreach ($loadedData as $item) {
                        if (is_array($item)) {
                            $ids[] = $item['id'] ?? $item['hotel_id'] ?? $item['branch_id'] ?? $item['cabang_id'] ?? null;
                        } elseif (is_object($item)) {
                            $ids[] = $item->id ?? $item->hotel_id ?? $item->branch_id ?? $item->cabang_id ?? null;
                        }
                    }
                }
            } catch (\Throwable $error) {
                // abaikan
            }
        }

        return $this->normalizeHotelIds($ids);
    }

    private function getHotelIdsFromUserAttributes($user): array
    {
        $ids = [];

        $attributeNames = [
            'hotel_ids',
            'hotel_id',
            'branch_ids',
            'branch_id',
            'cabang_ids',
            'cabang_id',
            'assigned_hotel_ids',
            'access_hotel_ids',
            'accessible_hotel_ids',
            'hotel_access_ids',
            'branch_access_ids',
        ];

        foreach ($attributeNames as $attribute) {
            try {
                $value = $user->{$attribute} ?? null;
                $ids = array_merge($ids, $this->normalizeHotelIds($value));
            } catch (\Throwable $error) {
                // abaikan attribute yang tidak ada
            }
        }

        return $this->normalizeHotelIds($ids);
    }

    private function getHotelIdsFromPivotTables($user): array
    {
        $userId = (int) ($user->id ?? 0);

        if (!$userId) {
            return [];
        }

        $candidateTables = [
            'hotel_user',
            'user_hotel',
            'hotel_users',
            'user_hotels',
            'hotel_user_access',
            'hotel_user_accesses',
            'user_hotel_access',
            'user_hotel_accesses',
            'user_branch_access',
            'user_branch_accesses',
            'branch_user',
            'user_branch',
            'branch_users',
            'user_branches',
            'admin_hotel',
            'hotel_admin',
            'admin_hotels',
            'hotel_admins',
            'admin_hotel_access',
            'admin_hotel_accesses',
        ];

        $ids = [];

        foreach ($candidateTables as $table) {
            if (!Schema::hasTable($table)) {
                continue;
            }

            $userColumn = $this->firstExistingColumn($table, [
                'user_id',
                'admin_id',
                'admin_user_id',
                'internal_user_id',
            ]);

            $hotelColumn = $this->firstExistingColumn($table, [
                'hotel_id',
                'branch_id',
                'cabang_id',
            ]);

            if (!$userColumn || !$hotelColumn) {
                continue;
            }

            try {
                $tableIds = DB::table($table)
                    ->where($userColumn, $userId)
                    ->pluck($hotelColumn)
                    ->toArray();

                $ids = array_merge($ids, $tableIds);
            } catch (\Throwable $error) {
                // abaikan table yang tidak cocok struktur
            }
        }

        return $this->normalizeHotelIds($ids);
    }

    private function normalizeHotelIds($value): array
    {
        if ($value instanceof \Illuminate\Support\Collection) {
            $value = $value->all();
        }

        if ($value === null || $value === '') {
            return [];
        }

        if (is_numeric($value)) {
            return [(int) $value];
        }

        if (is_string($value)) {
            $decoded = json_decode($value, true);

            if (json_last_error() === JSON_ERROR_NONE) {
                $value = $decoded;
            } else {
                $value = explode(',', $value);
            }
        }

        if (is_object($value)) {
            $value = [$value];
        }

        if (!is_array($value)) {
            return [];
        }

        $ids = [];

        foreach ($value as $item) {
            if ($item instanceof \Illuminate\Database\Eloquent\Model) {
                $ids[] = $item->id ?? $item->hotel_id ?? $item->branch_id ?? $item->cabang_id ?? null;
                continue;
            }

            if (is_object($item)) {
                $ids[] = $item->id ?? $item->hotel_id ?? $item->branch_id ?? $item->cabang_id ?? null;
                continue;
            }

            if (is_array($item)) {
                $ids[] = $item['id'] ?? $item['hotel_id'] ?? $item['branch_id'] ?? $item['cabang_id'] ?? null;
                continue;
            }

            if (is_numeric($item)) {
                $ids[] = (int) $item;
            }
        }

        return collect($ids)
            ->map(function ($id) {
                return (int) $id;
            })
            ->filter(function ($id) {
                return $id > 0;
            })
            ->unique()
            ->values()
            ->all();
    }

    private function firstExistingColumn(string $table, array $columns): ?string
    {
        foreach ($columns as $column) {
            if (Schema::hasColumn($table, $column)) {
                return $column;
            }
        }

        return null;
    }
}