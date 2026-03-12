<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Email atau password salah'
            ], 401);
        }

        $user = Auth::user();

        if ($user->role !== 'admin') {
            Auth::logout();

            return response()->json([
                'message' => 'Akses ditolak. Hanya admin yang bisa login.'
            ], 403);
        }

        return response()->json([
            'message' => 'Login admin berhasil',
            'user' => $user
        ]);
    }

    public function logout()
    {
        Auth::logout();

        return response()->json([
            'message' => 'Logout berhasil'
        ]);
    }
}