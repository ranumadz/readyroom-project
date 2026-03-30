<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

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
}