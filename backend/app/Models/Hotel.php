<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\City;
use App\Models\Room;
use App\Models\Facility;
use App\Models\Booking;
use App\Models\HotelImage;

class Hotel extends Model
{
    protected $fillable = [
        'city_id',
        'name',
        'area',
        'address',
        'wa_admin',
        'latitude',
        'longitude',
        'map_link',
        'description',
        'thumbnail',
        'hero_image',
        'rating',
        'status',

        // Tutup / buka booking hotel sementara
        'booking_is_closed',
        'booking_closed_reason',
        'booking_reopen_at',
    ];

    protected $casts = [
        'status' => 'boolean',
        'booking_is_closed' => 'boolean',
        'booking_reopen_at' => 'datetime',
    ];

    public function city()
    {
        return $this->belongsTo(City::class);
    }

    public function rooms()
    {
        return $this->hasMany(Room::class);
    }

    public function facilities()
    {
        return $this->belongsToMany(Facility::class, 'hotel_facilities');
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_hotels');
    }

    public function images()
    {
        return $this->hasMany(HotelImage::class);
    }
}