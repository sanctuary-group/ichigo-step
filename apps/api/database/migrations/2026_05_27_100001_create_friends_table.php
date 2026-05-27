<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('friends', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('line_channel_id')->constrained()->cascadeOnDelete();
            $table->string('line_user_id');
            $table->string('display_name')->nullable();
            $table->string('picture_url', 500)->nullable();
            $table->string('status_message', 500)->nullable();
            $table->boolean('is_following')->default(true);
            $table->boolean('is_hidden')->default(false);
            $table->timestamp('followed_at')->nullable();
            $table->timestamp('unfollowed_at')->nullable();
            $table->string('last_message_preview', 500)->nullable();
            $table->timestamp('last_message_at')->nullable();
            $table->unsignedInteger('unread_count')->default(0);
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(['line_channel_id', 'line_user_id']);
            $table->index(['organization_id', 'last_message_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('friends');
    }
};
