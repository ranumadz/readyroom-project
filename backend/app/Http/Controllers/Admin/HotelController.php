<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\Hotel;
use App\Models\Facility;
use App\Models\HotelImage;
use App\Models\Room;
use Illuminate\Http\Request;
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
        $hotels = Hotel::with(['city', 'facilities', 'images'])->latest()->get();

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

        return response()->json([
            'message' => 'Hotel berhasil ditambahkan',
            'data' => $hotel->load(['city', 'facilities', 'images'])
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

        return response()->json([
            'message' => 'Hotel berhasil diupdate',
            'data' => $hotel->fresh()->load(['city', 'facilities', 'images'])
        ]);
    }

    public function destroy($id)
    {
        $hotel = Hotel::with('images')->findOrFail($id);

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
}