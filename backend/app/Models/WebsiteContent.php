<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WebsiteContent extends Model
{
    use HasFactory;

    protected $fillable = [
        'hero_title',
        'hero_subtitle',
        'hero_image',

        'info_title',
        'info_description',
        'info_image',

        // PROMO 2 (BARU)
        'promo2_title',
        'promo2_description',
        'promo2_image',

        // video masih kita biarin dulu (biar gak ngerusak)
        'video_title',
        'video_description',
        'video_url',
        'video_path',

        'updated_by',
    ];

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}