<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('greetings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('line_channel_id')->constrained('line_channels')->cascadeOnDelete();
            $table->enum('type', ['new_friend', 'existing', 'unblock']);
            $table->boolean('is_active')->default(true);
            $table->enum('message_type', ['text', 'image'])->default('text');
            $table->text('text_content')->nullable();
            $table->string('image_url', 1024)->nullable();
            $table->string('image_preview_url', 1024)->nullable();
            $table->json('actions')->nullable();
            $table->timestamps();

            $table->unique(['line_channel_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('greetings');
    }
};
