<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\HotelController;
use App\Http\Controllers\Admin\RoomController;
use App\Http\Controllers\Admin\AuthController;

Route::prefix('admin')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/hotels', [HotelController::class, 'index']);
    Route::get('/hotels/create', [HotelController::class, 'create']);
    Route::post('/hotels', [HotelController::class, 'store']);

    Route::get('/rooms', [RoomController::class, 'index']);
    Route::get('/rooms/create', [RoomController::class, 'create']);
    Route::post('/rooms', [RoomController::class, 'store']);
});

Route::prefix('admin')->group(function () {
    Route::get('/hotels', [HotelController::class, 'index']);
    Route::get('/hotels/create', [HotelController::class, 'create']);
    Route::post('/hotels', [HotelController::class, 'store']);

    Route::get('/rooms', [RoomController::class, 'index']);
    Route::get('/rooms/create', [RoomController::class, 'create']);
    Route::post('/rooms', [RoomController::class, 'store']);
});