<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Room;

class RoomController extends Controller
{
    // GET rooms
    public function index()
    {
        $rooms = Room::with('hotel')->get();

        return response()->json($rooms);
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
            'hotel_id' => 'required',
            'name' => 'required',
            'type' => 'required',
            'capacity' => 'required|integer',
            'price_per_night' => 'required|numeric',
            'price_3h' => 'nullable|numeric',
            'price_6h' => 'nullable|numeric',
            'price_12h' => 'nullable|numeric',
            'total_rooms' => 'required|integer'
        ]);

        $room = Room::create($request->all());

        return response()->json([
            "message" => "Room berhasil ditambahkan",
            "data" => $room
        ]);
    }
}