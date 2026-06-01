<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('qr_attributions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('qr_action_id')->constrained('qr_actions')->cascadeOnDelete();
            $table->foreignId('line_channel_id')->constrained('line_channels')->cascadeOnDelete();
            // LIFF で取得した友だちの LINE userId（follow webhook と突き合わせる）
            $table->string('line_user_id');
            $table->timestamp('expires_at');
            $table->timestamp('consumed_at')->nullable();
            $table->timestamps();

            // follow 時に (channel, userId) 未消費を探す
            $table->index(['line_channel_id', 'line_user_id', 'consumed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('qr_attributions');
    }
};
