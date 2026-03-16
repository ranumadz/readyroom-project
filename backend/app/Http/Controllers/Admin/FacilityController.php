<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Facility;
use Illuminate\Http\Request;

class FacilityController extends Controller
{
    public function index()
    {
        $facilities = Facility::orderBy('id', 'desc')->get();

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
        ]);

        $facility = Facility::create([
            'name' => $request->name,
            'icon' => $request->icon,
            'status' => $request->has('status') ? $request->status : true,
        ]);

        return response()->json([
            'message' => 'Fasilitas berhasil ditambahkan',
            'data' => $facility,
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
            'data' => $facility,
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
        ]);

        $facility->update([
            'name' => $request->name,
            'icon' => $request->icon,
            'status' => $request->has('status') ? $request->status : $facility->status,
        ]);

        return response()->json([
            'message' => 'Fasilitas berhasil diperbarui',
            'data' => $facility,
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

        $facility->delete();

        return response()->json([
            'message' => 'Fasilitas berhasil dihapus',
        ], 200);
    }
}