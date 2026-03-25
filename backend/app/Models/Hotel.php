<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Hotel extends Model
{
    protected $fillable = [
        'city_id',
        'name',
        'area',
        'address',
        'wa_admin',
        'description',
        'thumbnail',
        'hero_image',
        'rating',
        'status',
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
}