<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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

                // Promo 1
                'info_title' => 'Promo Spesial ReadyRoom',
                'info_description' => 'Nikmati pengalaman booking hotel yang lebih cepat, aman, dan nyaman untuk kebutuhan harian maupun perjalanan bisnis.',
                'info_image' => null,

                // Promo 2
                'promo2_title' => 'Booking Lebih Fleksibel',
                'promo2_description' => 'ReadyRoom hadir dengan pilihan transit dan overnight yang lebih praktis untuk kebutuhan menginap singkat maupun harian.',
                'promo2_image' => null,

                // Video tetap dibiarkan dulu
                'video_title' => 'Lihat ReadyRoom Lebih Dekat',
                'video_description' => 'Tonton informasi singkat mengenai layanan, fasilitas, dan pengalaman booking di ReadyRoom.',
                'video_url' => null,
                'video_path' => null,

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
            'hero_image' => 'nullable|file|mimes:jpg,jpeg,png,webp|max:5120',

            // Promo 1
            'info_title' => 'nullable|string|max:255',
            'info_description' => 'nullable|string',
            'info_image' => 'nullable|file|mimes:jpg,jpeg,png,webp|max:5120',

            // Promo 2
            'promo2_title' => 'nullable|string|max:255',
            'promo2_description' => 'nullable|string',
            'promo2_image' => 'nullable|file|mimes:jpg,jpeg,png,webp|max:5120',

            // Video tetap dibiarkan dulu
            'video_title' => 'nullable|string|max:255',
            'video_description' => 'nullable|string',
            'video_url' => 'nullable|string|max:500',
            'video_file' => 'nullable|file|mimes:mp4,webm,mov,avi|max:51200',
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
                'hero_image' => null,

                'info_title' => $request->info_title,
                'info_description' => $request->info_description,
                'info_image' => null,

                'promo2_title' => $request->promo2_title,
                'promo2_description' => $request->promo2_description,
                'promo2_image' => null,

                'video_title' => $request->video_title,
                'video_description' => $request->video_description,
                'video_url' => $request->video_url,
                'video_path' => null,

                'updated_by' => $actor->id,
            ]);
        }

        $updateData = [
            'hero_title' => $request->filled('hero_title') ? $request->hero_title : $content->hero_title,
            'hero_subtitle' => $request->filled('hero_subtitle') ? $request->hero_subtitle : $content->hero_subtitle,

            // Promo 1
            'info_title' => $request->filled('info_title') ? $request->info_title : $content->info_title,
            'info_description' => $request->filled('info_description') ? $request->info_description : $content->info_description,

            // Promo 2
            'promo2_title' => $request->filled('promo2_title') ? $request->promo2_title : $content->promo2_title,
            'promo2_description' => $request->filled('promo2_description') ? $request->promo2_description : $content->promo2_description,

            // Video tetap dibiarkan dulu
            'video_title' => $request->filled('video_title') ? $request->video_title : $content->video_title,
            'video_description' => $request->filled('video_description') ? $request->video_description : $content->video_description,
            'video_url' => $request->filled('video_url') ? $request->video_url : $content->video_url,

            'updated_by' => $actor->id,
        ];

        // Upload hero image baru
        if ($request->hasFile('hero_image')) {
            if ($content->hero_image && Storage::disk('public')->exists($content->hero_image)) {
                Storage::disk('public')->delete($content->hero_image);
            }

            $heroImagePath = $request->file('hero_image')->store('website-content/hero', 'public');
            $updateData['hero_image'] = $heroImagePath;
        } else {
            $updateData['hero_image'] = $content->hero_image;
        }

        // Upload promo 1 image baru
        if ($request->hasFile('info_image')) {
            if ($content->info_image && Storage::disk('public')->exists($content->info_image)) {
                Storage::disk('public')->delete($content->info_image);
            }

            $infoImagePath = $request->file('info_image')->store('website-content/promo1', 'public');
            $updateData['info_image'] = $infoImagePath;
        } else {
            $updateData['info_image'] = $content->info_image;
        }

        // Upload promo 2 image baru
        if ($request->hasFile('promo2_image')) {
            if ($content->promo2_image && Storage::disk('public')->exists($content->promo2_image)) {
                Storage::disk('public')->delete($content->promo2_image);
            }

            $promo2ImagePath = $request->file('promo2_image')->store('website-content/promo2', 'public');
            $updateData['promo2_image'] = $promo2ImagePath;
        } else {
            $updateData['promo2_image'] = $content->promo2_image;
        }

        // Video tetap dibiarkan dulu
        if ($request->hasFile('video_file')) {
            if ($content->video_path && Storage::disk('public')->exists($content->video_path)) {
                Storage::disk('public')->delete($content->video_path);
            }

            $videoPath = $request->file('video_file')->store('website-content/video', 'public');
            $updateData['video_path'] = $videoPath;
        } else {
            $updateData['video_path'] = $content->video_path;
        }

        $content->update($updateData);

        return response()->json([
            'message' => 'Website content berhasil diupdate',
            'data' => $content->fresh('updater'),
        ]);
    }
}