<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rich_menu_folders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('name', 50);
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_system')->default(false);
            $table->timestamps();

            $table->index(['organization_id', 'sort_order']);
        });

        Schema::create('rich_menus', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('line_channel_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('rich_menu_folder_id')->nullable()
                ->constrained('rich_menu_folders')->nullOnDelete();
            $table->string('name', 50);
            $table->string('chat_bar_text', 14)->default('メニュー');
            $table->string('layout_key', 30);
            $table->enum('size', ['large', 'compact'])->default('large');
            $table->string('image_path')->nullable();
            $table->json('areas')->nullable();
            $table->boolean('is_published')->default(false);
            $table->string('line_rich_menu_id')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'rich_menu_folder_id']);
        });

        // 既存組織に「未分類」フォルダを seed
        foreach (DB::table('organizations')->pluck('id') as $orgId) {
            DB::table('rich_menu_folders')->insert([
                'organization_id' => $orgId,
                'name' => '未分類',
                'sort_order' => 0,
                'is_system' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('rich_menus');
        Schema::dropIfExists('rich_menu_folders');
    }
};
