<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Room;
use App\Models\RoomImage;

class RoomController extends Controller
{
    // GET rooms (admin)
    public function index()
    {
        $rooms = Room::with(['hotel.city', 'hotel.facilities', 'images', 'units'])->get();

        return response()->json($rooms);
    }

    /**
     * GET all active rooms (PUBLIC - customer)
     * hanya kamar aktif dari hotel aktif
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

        return response()->json([
            "message" => "All active rooms fetched successfully",
            "data" => $rooms
        ]);
    }

    // GET rooms by hotel (PUBLIC - customer)
    public function getByHotel($hotelId)
    {
        $rooms = Room::with(['hotel.city', 'hotel.facilities', 'images'])
            ->where('hotel_id', $hotelId)
            ->where('status', true)
            ->whereHas('hotel', function ($query) {
                $query->where('status', true);
            })
            ->get();

        return response()->json([
            "message" => "Rooms by hotel fetched successfully",
            "data" => $rooms
        ]);
    }

    // GET single room detail (PUBLIC - customer)
    public function showPublic($id)
    {
        $room = Room::with(['hotel.city', 'hotel.facilities', 'images'])
            ->where('status', true)
            ->whereHas('hotel', function ($query) {
                $query->where('status', true);
            })
            ->findOrFail($id);

        return response()->json([
            "message" => "Room detail fetched successfully",
            "data" => $room
        ]);
    }

    // GET form data (optional)
    public function create()
    {
        return response()->json([
            "message" => "Create room endpoint"
        ]);
    }

    // POST create room
    public function store(Request $request)
    {
        $request->validate([
            'hotel_id' => 'required|exists:hotels,id',
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:100',
            'capacity' => 'required|integer|min:1',
            'price_per_night' => 'required|numeric|min:0',
            'price_transit_3h' => 'nullable|numeric|min:0',
            'price_transit_6h' => 'nullable|numeric|min:0',
            'price_transit_12h' => 'nullable|numeric|min:0',
            'total_rooms' => 'required|integer|min:1',
            'description' => 'nullable|string',
            'thumbnail' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpg,jpeg,png,webp|max:4096',
            'status' => 'required|boolean',
        ]);

        $thumbnailPath = null;

        if ($request->hasFile('thumbnail')) {
            $thumbnailPath = $request->file('thumbnail')->store('rooms', 'public');
        }

        $room = Room::create([
            'hotel_id' => $request->hotel_id,
            'name' => $request->name,
            'type' => $request->type,
            'capacity' => $request->capacity,
            'price_per_night' => $request->price_per_night,
            'price_transit_3h' => $request->price_transit_3h ?? 0,
            'price_transit_6h' => $request->price_transit_6h ?? 0,
            'price_transit_12h' => $request->price_transit_12h ?? 0,
            'total_rooms' => $request->total_rooms,
            'available_rooms' => $request->total_rooms,
            'description' => $request->description,
            'thumbnail' => $thumbnailPath,
            'status' => $request->status,
        ]);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $image) {
                $imagePath = $image->store('rooms/gallery', 'public');

                RoomImage::create([
                    'room_id' => $room->id,
                    'image_path' => $imagePath,
                    'sort_order' => $index,
                ]);
            }
        }

        return response()->json([
            "message" => "Kamar berhasil ditambahkan",
            "data" => $room->load(['hotel.city', 'hotel.facilities', 'images', 'units'])
        ], 201);
    }
}