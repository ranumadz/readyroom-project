<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20|unique:customers,phone',
            'password' => 'required|min:6',
        ]);

        $otpCode = (string) rand(100000, 999999);

        $customer = Customer::create([
            'name' => $request->name,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'status' => true,
            'is_verified' => false,
            'otp_code' => $otpCode,
            'otp_expired_at' => now()->addMinutes(5),
        ]);

        $this->sendWhatsappOtp($request->phone, $otpCode);

        return response()->json([
            'message' => 'Register berhasil, kode OTP sudah dikirim ke WhatsApp',
            'customer' => $customer,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'password' => 'required|string',
        ]);

        $customer = Customer::where('phone', $request->phone)->first();

        if (!$customer) {
            return response()->json([
                'message' => 'Nomor WhatsApp tidak ditemukan',
            ], 404);
        }

        if (!$customer->status) {
            return response()->json([
                'message' => 'Akun tidak aktif',
            ], 403);
        }

        if (!$customer->is_verified) {
            return response()->json([
                'message' => 'Akun belum diverifikasi OTP',
            ], 403);
        }

        if (!Hash::check($request->password, $customer->password)) {
            return response()->json([
                'message' => 'Password salah',
            ], 401);
        }

        return response()->json([
            'message' => 'Login berhasil',
            'customer' => $customer,
        ], 200);
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'otp_code' => 'required|string',
        ]);

        $customer = Customer::where('phone', $request->phone)->first();

        if (!$customer) {
            return response()->json([
                'message' => 'Nomor WhatsApp tidak ditemukan',
            ], 404);
        }

        if ($customer->is_verified) {
            return response()->json([
                'message' => 'Akun sudah terverifikasi',
            ], 400);
        }

        if (!$customer->otp_code || !$customer->otp_expired_at) {
            return response()->json([
                'message' => 'OTP tidak tersedia',
            ], 400);
        }

        if (now()->gt($customer->otp_expired_at)) {
            return response()->json([
                'message' => 'OTP sudah kadaluarsa',
            ], 400);
        }

        if ($customer->otp_code !== $request->otp_code) {
            return response()->json([
                'message' => 'OTP salah',
            ], 400);
        }

        $customer->update([
            'is_verified' => true,
            'otp_code' => null,
            'otp_expired_at' => null,
        ]);

        return response()->json([
            'message' => 'OTP berhasil diverifikasi',
            'customer' => $customer,
        ], 200);
    }

    public function resendOtp(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
        ]);

        $customer = Customer::where('phone', $request->phone)->first();

        if (!$customer) {
            return response()->json([
                'message' => 'Nomor WhatsApp tidak ditemukan',
            ], 404);
        }

        if ($customer->is_verified) {
            return response()->json([
                'message' => 'Akun sudah terverifikasi',
            ], 400);
        }

        $otpCode = (string) rand(100000, 999999);

        $customer->update([
            'otp_code' => $otpCode,
            'otp_expired_at' => now()->addMinutes(5),
        ]);

        $this->sendWhatsappOtp($customer->phone, $otpCode);

        return response()->json([
            'message' => 'Kode OTP baru berhasil dikirim ke WhatsApp',
            'customer' => $customer,
        ], 200);
    }

    private function sendWhatsappOtp(string $phone, string $otpCode): array
    {
        $target = preg_replace('/^0/', '62', $phone);

        $message = "Kode OTP ReadyRoom kamu: {$otpCode}\n\nJangan bagikan kode ini ke siapa pun.\nBerlaku 5 menit.";

        $response = Http::withHeaders([
            'Authorization' => config('services.fonnte.token'),
        ])->asForm()->post(config('services.fonnte.url'), [
            'target' => $target,
            'message' => $message,
            'countryCode' => '62',
        ]);

        return [
            'success' => $response->successful(),
            'status' => $response->status(),
            'body' => $response->json() ?? $response->body(),
        ];
    }
}