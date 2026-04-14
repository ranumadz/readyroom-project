<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $rawPhone = $request->phone ?? '';
        $normalizedPhone = $this->normalizePhoneNumber($rawPhone);

        if (!$normalizedPhone) {
            throw ValidationException::withMessages([
                'phone' => ['Nomor WhatsApp tidak valid. Gunakan format 08xxxx atau 628xxxx.'],
            ]);
        }

        $request->merge([
            'phone' => $normalizedPhone,
        ]);

        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20|unique:customers,phone',
            'password' => 'required|min:6',
        ]);

        $otpCode = (string) rand(100000, 999999);

        $customer = Customer::create([
            'name' => $request->name,
            'phone' => $normalizedPhone,
            'password' => Hash::make($request->password),
            'status' => true,
            'is_verified' => false,
            'otp_code' => $otpCode,
            'otp_expired_at' => now()->addMinutes(5),
        ]);

        $otpResult = $this->sendWhatsappOtp($normalizedPhone, $otpCode);

        Log::info('REGISTER OTP RESULT', [
            'raw_phone' => $rawPhone,
            'normalized_phone' => $normalizedPhone,
            'result' => $otpResult,
        ]);

        if (!$otpResult['success']) {
            return response()->json([
                'message' => 'Register berhasil, tetapi OTP gagal dikirim ke WhatsApp',
                'customer' => $customer,
                'otp_status' => $otpResult,
            ], 500);
        }

        return response()->json([
            'message' => 'Register berhasil, kode OTP sudah dikirim ke WhatsApp',
            'customer' => $customer,
        ], 201);
    }

    public function login(Request $request)
    {
        $normalizedPhone = $this->normalizePhoneNumber($request->phone ?? '');

        if (!$normalizedPhone) {
            throw ValidationException::withMessages([
                'phone' => ['Nomor WhatsApp tidak valid.'],
            ]);
        }

        $request->merge([
            'phone' => $normalizedPhone,
        ]);

        $request->validate([
            'phone' => 'required|string',
            'password' => 'required|string',
        ]);

        $customer = Customer::where('phone', $normalizedPhone)->first();

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
        $normalizedPhone = $this->normalizePhoneNumber($request->phone ?? '');

        if (!$normalizedPhone) {
            throw ValidationException::withMessages([
                'phone' => ['Nomor WhatsApp tidak valid.'],
            ]);
        }

        $request->merge([
            'phone' => $normalizedPhone,
        ]);

        $request->validate([
            'phone' => 'required|string',
            'otp_code' => 'required|string',
        ]);

        $customer = Customer::where('phone', $normalizedPhone)->first();

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
        $normalizedPhone = $this->normalizePhoneNumber($request->phone ?? '');

        if (!$normalizedPhone) {
            throw ValidationException::withMessages([
                'phone' => ['Nomor WhatsApp tidak valid.'],
            ]);
        }

        $request->merge([
            'phone' => $normalizedPhone,
        ]);

        $request->validate([
            'phone' => 'required|string',
        ]);

        $customer = Customer::where('phone', $normalizedPhone)->first();

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

        $otpResult = $this->sendWhatsappOtp($customer->phone, $otpCode);

        Log::info('RESEND OTP RESULT', [
            'phone' => $customer->phone,
            'result' => $otpResult,
        ]);

        if (!$otpResult['success']) {
            return response()->json([
                'message' => 'OTP baru gagal dikirim ke WhatsApp',
                'customer' => $customer,
                'otp_status' => $otpResult,
            ], 500);
        }

        return response()->json([
            'message' => 'Kode OTP baru berhasil dikirim ke WhatsApp',
            'customer' => $customer,
        ], 200);
    }

    public function updateProfile(Request $request)
    {
        $request->validate([
            'id' => 'required|integer|exists:customers,id',
            'name' => 'required|string|max:255',
        ]);

        $customer = Customer::find($request->id);

        if (!$customer) {
            return response()->json([
                'message' => 'Customer tidak ditemukan',
            ], 404);
        }

        if (!$customer->status) {
            return response()->json([
                'message' => 'Akun tidak aktif',
            ], 403);
        }

        $customer->update([
            'name' => $request->name,
        ]);

        return response()->json([
            'message' => 'Profil berhasil diperbarui',
            'customer' => $customer,
        ], 200);
    }

    public function requestChangePhone(Request $request)
    {
        $normalizedNewPhone = $this->normalizePhoneNumber($request->new_phone ?? '');

        if (!$normalizedNewPhone) {
            throw ValidationException::withMessages([
                'new_phone' => ['Nomor WhatsApp baru tidak valid. Gunakan format 08xxxx atau 628xxxx.'],
            ]);
        }

        $request->merge([
            'new_phone' => $normalizedNewPhone,
        ]);

        $request->validate([
            'customer_id' => 'required|integer|exists:customers,id',
            'new_phone' => 'required|string|max:20',
        ]);

        $customer = Customer::find($request->customer_id);

        if (!$customer) {
            return response()->json([
                'message' => 'Customer tidak ditemukan',
            ], 404);
        }

        if (!$customer->status) {
            return response()->json([
                'message' => 'Akun tidak aktif',
            ], 403);
        }

        if ($customer->phone === $normalizedNewPhone) {
            return response()->json([
                'message' => 'Nomor WhatsApp baru tidak boleh sama dengan nomor saat ini',
            ], 400);
        }

        $phoneUsed = Customer::where('phone', $normalizedNewPhone)
            ->where('id', '!=', $customer->id)
            ->exists();

        if ($phoneUsed) {
            return response()->json([
                'message' => 'Nomor WhatsApp sudah digunakan oleh akun lain',
            ], 400);
        }

        $otpCode = (string) rand(100000, 999999);

        $customer->update([
            'new_phone' => $normalizedNewPhone,
            'new_phone_otp' => $otpCode,
            'new_phone_otp_expired_at' => now()->addMinutes(5),
        ]);

        $otpResult = $this->sendWhatsappOtp($normalizedNewPhone, $otpCode);

        Log::info('CHANGE PHONE OTP RESULT', [
            'phone' => $normalizedNewPhone,
            'result' => $otpResult,
        ]);

        if (!$otpResult['success']) {
            return response()->json([
                'message' => 'OTP ubah nomor gagal dikirim ke WhatsApp baru',
                'customer' => $customer,
                'otp_status' => $otpResult,
            ], 500);
        }

        return response()->json([
            'message' => 'Kode OTP untuk ubah nomor berhasil dikirim ke WhatsApp baru',
            'customer' => $customer,
        ], 200);
    }

    public function verifyChangePhoneOtp(Request $request)
    {
        $request->validate([
            'customer_id' => 'required|integer|exists:customers,id',
            'otp_code' => 'required|string',
        ]);

        $customer = Customer::find($request->customer_id);

        if (!$customer) {
            return response()->json([
                'message' => 'Customer tidak ditemukan',
            ], 404);
        }

        if (!$customer->status) {
            return response()->json([
                'message' => 'Akun tidak aktif',
            ], 403);
        }

        if (
            !$customer->new_phone ||
            !$customer->new_phone_otp ||
            !$customer->new_phone_otp_expired_at
        ) {
            return response()->json([
                'message' => 'Permintaan ubah nomor tidak ditemukan',
            ], 400);
        }

        if (now()->gt($customer->new_phone_otp_expired_at)) {
            return response()->json([
                'message' => 'OTP ubah nomor sudah kadaluarsa',
            ], 400);
        }

        if ($customer->new_phone_otp !== $request->otp_code) {
            return response()->json([
                'message' => 'OTP ubah nomor salah',
            ], 400);
        }

        $newPhone = $customer->new_phone;

        $phoneUsed = Customer::where('phone', $newPhone)
            ->where('id', '!=', $customer->id)
            ->exists();

        if ($phoneUsed) {
            return response()->json([
                'message' => 'Nomor WhatsApp baru sudah digunakan oleh akun lain',
            ], 400);
        }

        $customer->update([
            'phone' => $newPhone,
            'new_phone' => null,
            'new_phone_otp' => null,
            'new_phone_otp_expired_at' => null,
        ]);

        return response()->json([
            'message' => 'Nomor WhatsApp berhasil diperbarui',
            'customer' => $customer,
        ], 200);
    }

    /**
     * Kirim OTP melalui WhatsApp menggunakan Fonnte
     */
    private function sendWhatsappOtp(string $phone, string $otpCode): array
    {
        try {
            $token = config('services.fonnte.token');
            $url = config('services.fonnte.url', 'https://api.fonnte.com/send');

            if (!$token || !$url) {
                Log::error('FONNTE CONFIG ERROR', [
                    'message' => 'Fonnte config tidak lengkap',
                    'token_exists' => !empty($token),
                    'url' => $url,
                ]);

                return [
                    'success' => false,
                    'status' => 500,
                    'body' => 'Fonnte config tidak lengkap',
                ];
            }

            $target = $this->normalizePhoneNumber($phone);

            if (!$target) {
                Log::error('FONNTE OTP ERROR', [
                    'message' => 'Nomor target tidak valid setelah normalisasi',
                    'phone' => $phone,
                ]);

                return [
                    'success' => false,
                    'status' => 422,
                    'body' => 'Nomor target tidak valid',
                ];
            }

            $message = "Kode OTP ReadyRoom kamu: {$otpCode}\n\n"
                . "Jangan bagikan kode ini ke siapa pun.\n"
                . "Berlaku selama 5 menit.";

            $response = Http::timeout(30)
                ->withHeaders([
                    'Authorization' => $token,
                ])
                ->asForm()
                ->post($url, [
                    'target' => (string) $target,
                    'message' => $message,
                ]);

            $responseBody = $response->json();

            if (!$responseBody) {
                $responseBody = $response->body();
            }

            $fonnteStatus = false;

            if (is_array($responseBody) && array_key_exists('status', $responseBody)) {
                $fonnteStatus = (bool) $responseBody['status'];
            }

            $isSuccess = $response->successful() && $fonnteStatus;

            Log::info('FONNTE OTP RESPONSE', [
                'url' => $url,
                'raw_phone' => $phone,
                'target' => $target,
                'http_status' => $response->status(),
                'http_successful' => $response->successful(),
                'fonnte_status' => $fonnteStatus,
                'body' => $responseBody,
            ]);

            return [
                'success' => $isSuccess,
                'status' => $response->status(),
                'body' => $responseBody,
            ];
        } catch (\Throwable $e) {
            Log::error('FONNTE OTP ERROR', [
                'message' => $e->getMessage(),
                'phone' => $phone,
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'status' => 500,
                'body' => $e->getMessage(),
            ];
        }
    }

    /**
     * Normalisasi nomor ke format 62xxxxxxxxxx
     */
    private function normalizePhoneNumber(string $phone): ?string
    {
        $target = preg_replace('/\D/', '', $phone);

        if (!$target) {
            return null;
        }

        if (substr($target, 0, 1) === '0') {
            $target = '62' . substr($target, 1);
        } elseif (substr($target, 0, 2) !== '62') {
            $target = '62' . ltrim($target, '0');
        }

        if (strlen($target) < 10 || strlen($target) > 15) {
            return null;
        }

        return (string) $target;
    }
}