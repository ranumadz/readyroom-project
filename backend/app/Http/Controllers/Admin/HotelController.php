<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\City;
use App\Models\Hotel;
use Illuminate\Http\Request;

class HotelController extends Controller
{
    public function index()
    {
        $hotels = Hotel::with('city')->latest()->get();
        return response()->json($hotels);
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
            'description' => 'nullable|string',
            'thumbnail' => 'nullable|string',
            'hero_image' => 'nullable|string',
            'rating' => 'nullable|numeric|min:0|max:5',
            'status' => 'nullable|boolean',
        ]);

        $hotel = Hotel::create([
            'city_id' => $request->city_id,
            'name' => $request->name,
            'area' => $request->area,
            'address' => $request->address,
            'description' => $request->description,
            'thumbnail' => $request->thumbnail,
            'hero_image' => $request->hero_image,
            'rating' => $request->rating ?? 0,
            'status' => $request->status ?? true,
        ]);

        return response()->json([
            'message' => 'Hotel berhasil ditambahkan',
            'data' => $hotel
        ], 201);
    }
}