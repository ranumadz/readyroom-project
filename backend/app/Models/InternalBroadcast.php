<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;
use App\Models\InternalBroadcastDismissal;

class InternalBroadcast extends Model
{
    protected $fillable = [
        'sent_by',
        'title',
        'message',
        'target_roles',
        'is_active',
        'show_as_modal',
        'show_as_banner',
    ];

    protected $casts = [
        'target_roles' => 'array',
        'is_active' => 'boolean',
        'show_as_modal' => 'boolean',
        'show_as_banner' => 'boolean',
    ];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sent_by');
    }

    public function dismissals()
    {
        return $this->hasMany(InternalBroadcastDismissal::class, 'internal_broadcast_id');
    }
}