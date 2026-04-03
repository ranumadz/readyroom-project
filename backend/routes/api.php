<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Admin\HotelController;
use App\Http\Controllers\Admin\RoomController;
use App\Http\Controllers\Admin\FacilityController;
use App\Http\Controllers\Admin\RoomUnitController;
use App\Http\Controllers\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Admin\BookingPenaltyController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Customer\BookingController;
use App\Http\Controllers\Admin\WebsiteContentController;

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
Route::get('/my-bookings', [BookingController::class, 'index']);
Route::post('/bookings', [BookingController::class, 'store']);

// =========================
// Public Website Content
// =========================
Route::get('/website-content', [WebsiteContentController::class, 'index']);

// =========================
// Public Hotels
// =========================
Route::get('/hotels', [HotelController::class, 'publicIndex']);
Route::get('/hotels/{id}', [HotelController::class, 'publicShow']);
Route::get('/hotels/{hotelId}/rooms', [RoomController::class, 'getByHotel']);

// =========================
// Public Room Detail
// =========================
Route::get('/rooms/{id}', [RoomController::class, 'showPublic']);

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
    Route::put('/hotels/{id}', [HotelController::class, 'update']);
    Route::post('/hotels/{id}', [HotelController::class, 'update']);
    Route::delete('/hotels/{id}', [HotelController::class, 'destroy']);

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
    // Users Internal & Customers
    // =========================
    Route::get('/users/admin', [UserController::class, 'adminUsers']);
    Route::post('/users/admin', [UserController::class, 'storeAdminUser']);
    Route::put('/users/admin/{id}', [UserController::class, 'updateAdminUser']);
    Route::post('/users/admin/{id}/reset-password', [UserController::class, 'resetAdminPassword']);
    Route::post('/users/admin/{id}/toggle-status', [UserController::class, 'toggleAdminStatus']);

    Route::get('/users/customers', [UserController::class, 'customers']);
    Route::post('/users/customers/{id}/reset-password', [UserController::class, 'resetCustomerPassword']);
    Route::post('/users/customers/{id}/toggle-status', [UserController::class, 'toggleCustomerStatus']);

    // =========================
    // Bookings
    // =========================
    Route::get('/bookings', [AdminBookingController::class, 'index']);
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
    Route::post('/bookings/{id}/cancel', [AdminBookingController::class, 'cancelBooking']);
    Route::post('/bookings/{id}/check-in', [AdminBookingController::class, 'checkIn']);
    Route::post('/bookings/{id}/check-out', [AdminBookingController::class, 'checkOut']);
    Route::post('/bookings/{id}/start-cleaning', [AdminBookingController::class, 'startCleaning']);
    Route::post('/bookings/{id}/finish-cleaning', [AdminBookingController::class, 'finishCleaning']);

    // =========================
    // Booking Penalties
    // =========================
    Route::get('/bookings/{bookingId}/penalties', [BookingPenaltyController::class, 'index']);
    Route::post('/bookings/{bookingId}/penalties', [BookingPenaltyController::class, 'store']);
    Route::delete('/bookings/{bookingId}/penalties/{penaltyId}', [BookingPenaltyController::class, 'destroy']);

    // =========================
    // Website Content
    // =========================
    Route::get('/website-content', [WebsiteContentController::class, 'index']);
    Route::post('/website-content', [WebsiteContentController::class, 'update']);
});