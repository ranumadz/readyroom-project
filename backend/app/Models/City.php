<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class City extends Model
{
    protected $fillable = [
        'name',
        'status',
    ];

    public function hotels()
    {
        return $this->hasMany(Hotel::class);
    }
}