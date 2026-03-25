<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\Hotel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class HotelController extends Controller
{
    public function index()
    {
        $hotels = Hotel::with('city')->latest()->get();
        return response()->json($hotels);
    }

    /**
     * Public hotel list untuk customer
     * hanya hotel aktif
     */
    public function publicIndex()
    {
        $hotels = Hotel::with('city')
            ->where('status', true)
            ->latest()
            ->get();

        return response()->json([
            'message' => 'Daftar hotel berhasil diambil',
            'data' => $hotels
        ]);
    }

    /**
     * Public detail hotel untuk customer
     */
    public function publicShow($id)
    {
        $hotel = Hotel::with('city')
            ->where('status', true)
            ->findOrFail($id);

        return response()->json([
            'message' => 'Detail hotel berhasil diambil',
            'data' => $hotel
        ]);
    }

    public function create()
    {
        $cities = City::where('status', true)->get();
        return response()->json($cities);
    }

    public function store(Request $request)
    {
        $request->validate([
            'city_id' => 'required|exists:cities,id',
            'name' => 'required|string|max:255',
            'area' => 'required|string|max:255',
            'address' => 'required|string',
            'wa_admin' => 'nullable|string|max:30',
            'description' => 'nullable|string',
            'thumbnail' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'hero_image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'rating' => 'nullable|numeric|min:0|max:5',
            'status' => 'nullable|boolean',
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
            'area' => $request->area,
            'address' => $request->address,
            'wa_admin' => $request->wa_admin,
            'description' => $request->description,
            'thumbnail' => $thumbnailPath,
            'hero_image' => $heroImagePath,
            'rating' => $request->rating ?? 0,
            'status' => $request->status ?? true,
        ]);

        return response()->json([
            'message' => 'Hotel berhasil ditambahkan',
            'data' => $hotel
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $hotel = Hotel::findOrFail($id);

        $request->validate([
            'city_id' => 'required|exists:cities,id',
            'name' => 'required|string|max:255',
            'area' => 'required|string|max:255',
            'address' => 'required|string',
            'wa_admin' => 'nullable|string|max:30',
            'description' => 'nullable|string',
            'thumbnail' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'hero_image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'rating' => 'nullable|numeric|min:0|max:5',
            'status' => 'nullable|boolean',
        ]);

        $data = [
            'city_id' => $request->city_id,
            'name' => $request->name,
            'area' => $request->area,
            'address' => $request->address,
            'wa_admin' => $request->wa_admin,
            'description' => $request->description,
            'rating' => $request->rating ?? $hotel->rating,
            'status' => $request->status ?? $hotel->status,
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

        return response()->json([
            'message' => 'Hotel berhasil diupdate',
            'data' => $hotel->load('city')
        ]);
    }

    public function destroy($id)
    {
        $hotel = Hotel::findOrFail($id);

        if ($hotel->thumbnail && Storage::disk('public')->exists($hotel->thumbnail)) {
            Storage::disk('public')->delete($hotel->thumbnail);
        }

        if ($hotel->hero_image && Storage::disk('public')->exists($hotel->hero_image)) {
            Storage::disk('public')->delete($hotel->hero_image);
        }

        $hotel->delete();

        return response()->json([
            'message' => 'Hotel berhasil dihapus'
        ]);
    }
}