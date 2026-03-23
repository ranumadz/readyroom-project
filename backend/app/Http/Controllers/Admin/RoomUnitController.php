<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RoomUnit;

class RoomUnitController extends Controller
{
    public function indexByRoom($roomId)
    {
        $units = RoomUnit::where('room_id', $roomId)->get();

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
                'message' => 'Nomor kamar sudah ada untuk tipe kamar ini'
            ], 422);
        }

        $unit = RoomUnit::create([
            'room_id' => $request->room_id,
            'room_number' => $request->room_number,
            'status' => $request->status,
        ]);

        return response()->json([
            'message' => 'Kamar fisik berhasil ditambahkan',
            'data' => $unit
        ], 201);
    }
}