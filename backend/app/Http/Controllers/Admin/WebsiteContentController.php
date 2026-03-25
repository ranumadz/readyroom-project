<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\WebsiteContent;
use App\Models\User;

class WebsiteContentController extends Controller
{
    /**
     * Ambil website content utama
     * Dipakai admin dan customer
     */
    public function index()
    {
        $content = WebsiteContent::with('updater')->first();

        if (!$content) {
            $content = WebsiteContent::create([
                'hero_title' => 'Temukan Kamar Nyaman dengan Mudah',
                'hero_subtitle' => 'Pesan hotel transit atau overnight lebih cepat, praktis, dan modern bersama ReadyRoom.',
                'hero_image' => null,
                'info_title' => 'Info Terbaru ReadyRoom',
                'info_description' => 'Nikmati pengalaman booking hotel yang lebih cepat, aman, dan nyaman untuk kebutuhan harian maupun perjalanan bisnis.',
                'info_image' => null,
                'video_title' => 'Lihat ReadyRoom Lebih Dekat',
                'video_description' => 'Tonton informasi singkat mengenai layanan, fasilitas, dan pengalaman booking di ReadyRoom.',
                'video_url' => null,
                'updated_by' => null,
            ]);
        }

        return response()->json([
            'message' => 'Website content berhasil diambil',
            'data' => $content,
        ]);
    }

    /**
     * Update website content
     * Hanya boss / super_admin
     */
    public function update(Request $request)
    {
        $request->validate([
            'updated_by' => 'required|exists:users,id',

            'hero_title' => 'nullable|string|max:255',
            'hero_subtitle' => 'nullable|string',
            'hero_image' => 'nullable|string|max:255',

            'info_title' => 'nullable|string|max:255',
            'info_description' => 'nullable|string',
            'info_image' => 'nullable|string|max:255',

            'video_title' => 'nullable|string|max:255',
            'video_description' => 'nullable|string',
            'video_url' => 'nullable|string|max:500',
        ]);

        $actor = User::find($request->updated_by);

        if (!$actor || !in_array($actor->role, ['boss', 'super_admin'])) {
            return response()->json([
                'message' => 'Hanya boss atau super admin yang boleh mengubah website content'
            ], 403);
        }

        $content = WebsiteContent::first();

        if (!$content) {
            $content = WebsiteContent::create([
                'hero_title' => $request->hero_title,
                'hero_subtitle' => $request->hero_subtitle,
                'hero_image' => $request->hero_image,
                'info_title' => $request->info_title,
                'info_description' => $request->info_description,
                'info_image' => $request->info_image,
                'video_title' => $request->video_title,
                'video_description' => $request->video_description,
                'video_url' => $request->video_url,
                'updated_by' => $actor->id,
            ]);
        } else {
            $content->update([
                'hero_title' => $request->hero_title,
                'hero_subtitle' => $request->hero_subtitle,
                'hero_image' => $request->hero_image,
                'info_title' => $request->info_title,
                'info_description' => $request->info_description,
                'info_image' => $request->info_image,
                'video_title' => $request->video_title,
                'video_description' => $request->video_description,
                'video_url' => $request->video_url,
                'updated_by' => $actor->id,
            ]);
        }

        return response()->json([
            'message' => 'Website content berhasil diupdate',
            'data' => $content->fresh('updater'),
        ]);
    }
}