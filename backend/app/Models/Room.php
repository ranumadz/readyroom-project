<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    protected $fillable = [
        'hotel_id',
        'name',
        'type',
        'capacity',
        'price_per_night',
        'price_transit_3h',
        'price_transit_6h',
        'price_transit_12h',
        'total_rooms',
        'available_rooms',
        'description',
        'thumbnail',
        'status',
    ];

    /*
    |--------------------------------------------------------------------------
    | RELATIONSHIP
    |--------------------------------------------------------------------------
    */

    // Relasi ke hotel
    public function hotel()
    {
        return $this->belongsTo(Hotel::class);
    }

    // Relasi ke booking
    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    // Relasi ke gambar kamar (MULTIPLE IMAGE)
    public function images()
    {
        return $this->hasMany(RoomImage::class);
    }

    // Relasi ke kamar fisik
    public function units()
    {
        return $this->hasMany(RoomUnit::class);
    }
}