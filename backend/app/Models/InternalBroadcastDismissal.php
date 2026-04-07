<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\InternalBroadcast;

class InternalBroadcastDismissal extends Model
{
    protected $fillable = [
        'user_id',
        'internal_broadcast_id',
        'dismissed_at',
    ];

    protected $casts = [
        'dismissed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function broadcast()
    {
        return $this->belongsTo(InternalBroadcast::class, 'internal_broadcast_id');
    }
}