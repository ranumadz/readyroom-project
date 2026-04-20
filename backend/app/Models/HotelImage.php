<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Hotel;

class HotelImage extends Model
{
    protected $fillable = [
        'hotel_id',
        'image',
    ];

    public function hotel()
    {
        return $this->belongsTo(Hotel::class);
    }
}