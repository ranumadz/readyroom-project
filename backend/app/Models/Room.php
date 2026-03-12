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

    public function hotel()
    {
        return $this->belongsTo(Hotel::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}