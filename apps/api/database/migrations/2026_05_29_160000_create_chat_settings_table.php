<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chat_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->unique()->constrained()->cascadeOnDelete();
            // shift_enter_send / enter_send
            $table->string('send_shortcut', 20)->default('shift_enter_send');
            $table->boolean('short_url')->default(false);
            $table->boolean('send_preview')->default(true);
            // 自動確認済み変更フラグ群
            $table->json('auto_read')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_settings');
    }
};
