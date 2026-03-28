<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Customer;
use App\Models\User;
use App\Models\Hotel;
use App\Models\Room;
use App\Models\RoomUnit;

class Booking extends Model
{
    protected $fillable = [
        'booking_code',
        'user_id',
        'guest_name',
        'guest_phone',
        'guest_email',
        'booking_source',
        'created_by',
        'edited_by',

        'hotel_id',
        'room_id',
        'room_unit_id',

        'booking_type',
        'duration_hours',

        'check_in',
        'check_out',

        'total_price',
        'discount_percent',

        'refund_amount',
        'refund_reason',
        'refunded_by',
        'refunded_at',

        'cancel_reason',
        'cancelled_by',
        'cancelled_at',

        'status',
        'payment_status',

        'admin_note',
        'rejection_reason_internal',
        'rejection_reason_customer',
    ];

    /*
    |--------------------------------------------------------------------------
    | RELATIONS
    |--------------------------------------------------------------------------
    */

    // Customer (kalau booking dari app customer)
    public function user()
    {
        return $this->belongsTo(Customer::class, 'user_id');
    }

    // Hotel
    public function hotel()
    {
        return $this->belongsTo(Hotel::class);
    }

    // Room Type
    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    // Room Unit (kamar fisik)
    public function roomUnit()
    {
        return $this->belongsTo(RoomUnit::class);
    }

    // Admin yang membuat booking
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Admin yang terakhir mengedit booking
    public function editor()
    {
        return $this->belongsTo(User::class, 'edited_by');
    }

    // Admin / Boss / Super Admin yang melakukan refund
    public function refunder()
    {
        return $this->belongsTo(User::class, 'refunded_by');
    }

    // Admin / Boss / Super Admin yang melakukan cancel
    public function canceller()
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }
}