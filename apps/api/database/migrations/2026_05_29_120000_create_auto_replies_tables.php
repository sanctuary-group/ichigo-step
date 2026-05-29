<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('auto_reply_folders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('name', 50);
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_system')->default(false);
            $table->timestamps();

            $table->index(['organization_id', 'sort_order']);
        });

        Schema::create('auto_replies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('auto_reply_folder_id')->nullable()
                ->constrained('auto_reply_folders')->nullOnDelete();
            $table->enum('trigger_type', ['all', 'keyword', 'follow'])->default('keyword');
            $table->enum('match_mode', ['partial', 'exact'])->default('partial');
            $table->json('keywords')->nullable();
            $table->boolean('exclude_bracket')->default(false);
            $table->enum('audience', ['active', 'blocked'])->default('active');
            $table->enum('schedule_type', ['always', 'business', 'custom'])->default('always');
            $table->timestamp('schedule_start')->nullable();
            $table->timestamp('schedule_end')->nullable();
            $table->enum('action_mode', ['once', 'repeat'])->default('repeat');
            $table->enum('message_type', ['text', 'image'])->default('text');
            $table->text('text_content')->nullable();
            $table->string('image_url', 1024)->nullable();
            $table->string('image_preview_url', 1024)->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('hit_count')->default(0);
            $table->timestamps();

            $table->index(['organization_id', 'auto_reply_folder_id']);
            $table->index(['organization_id', 'is_active', 'trigger_type']);
        });

        // action_mode = once の重複発火防止 + 発火履歴
        Schema::create('auto_reply_triggers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('auto_reply_id')->constrained()->cascadeOnDelete();
            $table->foreignId('friend_id')->constrained()->cascadeOnDelete();
            $table->timestamp('triggered_at');

            $table->unique(['auto_reply_id', 'friend_id']);
        });

        foreach (DB::table('organizations')->pluck('id') as $orgId) {
            DB::table('auto_reply_folders')->insert([
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
        Schema::dropIfExists('auto_reply_triggers');
        Schema::dropIfExists('auto_replies');
        Schema::dropIfExists('auto_reply_folders');
    }
};
