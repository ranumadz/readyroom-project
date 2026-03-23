<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Admin\HotelController;
use App\Http\Controllers\Admin\RoomController;
use App\Http\Controllers\Admin\FacilityController;
use App\Http\Controllers\Admin\RoomUnitController;
use App\Http\Controllers\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Customer\BookingController;

// =========================
// Customer Auth
// =========================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/resend-otp', [AuthController::class, 'resendOtp']);

// =========================
// Customer Booking
// =========================
Route::post('/bookings', [BookingController::class, 'store']);

// =========================
// Dev Helper
// =========================
Route::post('/dev/create-admin', function () {
    \App\Models\User::create([
        'name' => 'Super Admin ReadyRoom',
        'email' => 'superadmin@readyroom.com',
        'password' => \Illuminate\Support\Facades\Hash::make('12345678'),
        'role' => 'super_admin',
    ]);

    return response()->json([
        'message' => 'Super admin berhasil dibuat'
    ]);
});

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/
Route::prefix('admin')->group(function () {

    // =========================
    // Auth
    // =========================
    Route::post('/login', [AdminAuthController::class, 'login']);
    Route::post('/logout', [AdminAuthController::class, 'logout']);

    // =========================
    // Hotels
    // =========================
    Route::get('/hotels', [HotelController::class, 'index']);
    Route::get('/hotels/create', [HotelController::class, 'create']);
    Route::post('/hotels', [HotelController::class, 'store']);

    // =========================
    // Rooms
    // =========================
    Route::get('/rooms', [RoomController::class, 'index']);
    Route::get('/rooms/create', [RoomController::class, 'create']);
    Route::post('/rooms', [RoomController::class, 'store']);

    // =========================
    // Facilities
    // =========================
    Route::get('/facilities', [FacilityController::class, 'index']);
    Route::post('/facilities', [FacilityController::class, 'store']);
    Route::get('/facilities/{id}', [FacilityController::class, 'show']);
    Route::put('/facilities/{id}', [FacilityController::class, 'update']);
    Route::delete('/facilities/{id}', [FacilityController::class, 'destroy']);

    // =========================
    // Room Units
    // =========================
    Route::post('/room-units', [RoomUnitController::class, 'store']);
    Route::get('/room-units/{roomId}', [RoomUnitController::class, 'indexByRoom']);

    // =========================
    // Bookings
    // =========================
    Route::get('/bookings', [AdminBookingController::class, 'index']);

    // 🔥 NEW: Calendar endpoint
    Route::get('/bookings/calendar', [AdminBookingController::class, 'calendar']);

    Route::post('/bookings/manual', [AdminBookingController::class, 'storeManual']);
    Route::post('/bookings/{id}/approve', [AdminBookingController::class, 'approve']);
    Route::post('/bookings/{id}/reject', [AdminBookingController::class, 'reject']);
    Route::post('/bookings/{id}/update', [AdminBookingController::class, 'updateBooking']);

    // =========================
    // Booking Operational Flow
    // =========================
    Route::post('/bookings/{id}/paid', [AdminBookingController::class, 'markPaid']);
    Route::post('/bookings/{id}/refund', [AdminBookingController::class, 'refundBooking']);
    Route::post('/bookings/{id}/check-in', [AdminBookingController::class, 'checkIn']);
    Route::post('/bookings/{id}/check-out', [AdminBookingController::class, 'checkOut']);
    Route::post('/bookings/{id}/start-cleaning', [AdminBookingController::class, 'startCleaning']);
    Route::post('/bookings/{id}/finish-cleaning', [AdminBookingController::class, 'finishCleaning']);
});