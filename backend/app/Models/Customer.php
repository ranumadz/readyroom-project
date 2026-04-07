<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Customer extends Authenticatable
{
    use Notifiable;

    protected $table = 'customers';

    protected $fillable = [
        'name',
        'phone',
        'new_phone',
        'new_phone_otp',
        'new_phone_otp_expired_at',
        'password',
        'status',
        'is_verified',
        'otp_code',
        'otp_expired_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'status' => 'boolean',
        'is_verified' => 'boolean',
        'otp_expired_at' => 'datetime',
        'new_phone_otp_expired_at' => 'datetime',
    ];
}