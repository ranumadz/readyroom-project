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
use App\Http\Controllers\Admin\InternalBroadcastController;

// =========================
// Customer Auth
// =========================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/resend-otp', [AuthController::class, 'resendOtp']);
Route::post('/update-profile', [AuthController::class, 'updateProfile']);
Route::post('/request-change-phone', [AuthController::class, 'requestChangePhone']);
Route::post('/verify-change-phone-otp', [AuthController::class, 'verifyChangePhoneOtp']);

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
// Public Rooms
// =========================
Route::get('/rooms', [RoomController::class, 'publicIndex']);
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

    // Tutup / buka booking hotel sementara
    Route::post('/hotels/{id}/close-booking', [HotelController::class, 'closeBooking']);
    Route::post('/hotels/{id}/open-booking', [HotelController::class, 'openBooking']);

    Route::delete('/hotels/{id}', [HotelController::class, 'destroy']);

    // =========================
    // Cities
    // =========================
    Route::post('/cities', [HotelController::class, 'storeCity']);

    // ✅ FIX HAPUS KOTA DI ADD HOTEL
    // Dipakai frontend AddHotel.jsx:
    // DELETE /api/admin/cities/{id}
    Route::delete('/cities/{id}', [HotelController::class, 'destroyCity']);

    // =========================
    // Rooms
    // =========================
    Route::get('/rooms', [RoomController::class, 'index']);
    Route::get('/rooms/create', [RoomController::class, 'create']);
    Route::post('/rooms', [RoomController::class, 'store']);

    // ✅ FIX EDIT ROOM MODAL
    // Dipakai frontend RoomsList.jsx saat edit room:
    // PUT  /api/admin/rooms/{id}
    // POST /api/admin/rooms/{id} dengan _method=PUT
    Route::put('/rooms/{id}', [RoomController::class, 'update']);
    Route::post('/rooms/{id}', [RoomController::class, 'update']);

    // Optional aman untuk nanti kalau butuh hapus room dari admin.
    Route::delete('/rooms/{id}', [RoomController::class, 'destroy']);

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

    // ✅ FIX MONITORING KAMAR
    // Dipakai frontend RoomUnits.jsx saat ubah status kamar fisik:
    // PUT  /api/admin/room-units/{id}
    // POST /api/admin/room-units/{id} dengan _method=PUT
    Route::put('/room-units/{id}', [RoomUnitController::class, 'update']);
    Route::post('/room-units/{id}', [RoomUnitController::class, 'update']);

    // ✅ HAPUS KAMAR FISIK / ROOM UNIT
    // Dipakai frontend RoomUnits.jsx untuk hapus kamar 101, 102, A01, dll.
    Route::delete('/room-units/{id}', [RoomUnitController::class, 'destroy']);

    // Tetap dipertahankan untuk ambil daftar unit berdasarkan room_id.
    Route::get('/room-units/{roomId}', [RoomUnitController::class, 'indexByRoom']);

    // =========================
    // Users Internal & Customers
    // =========================
    Route::get('/users/admin', [UserController::class, 'adminUsers']);
    Route::post('/users/admin', [UserController::class, 'storeAdminUser']);
    Route::put('/users/admin/{id}', [UserController::class, 'updateAdminUser']);
    Route::delete('/users/admin/{id}', [UserController::class, 'deleteAdminUser']);
    Route::post('/users/admin/{id}/reset-password', [UserController::class, 'resetAdminPassword']);
    Route::post('/users/admin/{id}/toggle-status', [UserController::class, 'toggleAdminStatus']);

    Route::get('/users/customers', [UserController::class, 'customers']);
    Route::delete('/users/customers/{id}', [UserController::class, 'deleteCustomer']);
    Route::post('/users/customers/{id}/reset-password', [UserController::class, 'resetCustomerPassword']);
    Route::post('/users/customers/{id}/toggle-status', [UserController::class, 'toggleCustomerStatus']);

    // =========================
    // Internal Broadcast
    // =========================
    Route::get('/internal-broadcasts', [InternalBroadcastController::class, 'index']);
    Route::get('/internal-broadcasts/active', [InternalBroadcastController::class, 'active']);
    Route::post('/internal-broadcasts', [InternalBroadcastController::class, 'store']);
    Route::put('/internal-broadcasts/{id}', [InternalBroadcastController::class, 'update']);
    Route::post('/internal-broadcasts/{id}/dismiss', [InternalBroadcastController::class, 'dismiss']);
    Route::post('/internal-broadcasts/{id}/toggle-status', [InternalBroadcastController::class, 'toggleStatus']);
    Route::delete('/internal-broadcasts/{id}', [InternalBroadcastController::class, 'destroy']);

    // =========================
    // Bookings
    // =========================
    Route::get('/bookings', [AdminBookingController::class, 'index']);
    Route::get('/bookings/calendar', [AdminBookingController::class, 'calendar']);
    Route::post('/bookings/manual', [AdminBookingController::class, 'storeManual']);
    Route::post('/bookings/{id}/approve', [AdminBookingController::class, 'approve']);
    Route::post('/bookings/{id}/reject', [AdminBookingController::class, 'reject']);
    Route::post('/bookings/{id}/update', [AdminBookingController::class, 'updateBooking']);

    // Hapus / arsip booking dari list operasional.
    // Dipakai frontend BookingList.jsx:
    // DELETE /api/admin/bookings/{id}
    Route::delete('/bookings/{id}', [AdminBookingController::class, 'destroy']);

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