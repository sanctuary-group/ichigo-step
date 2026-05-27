<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('broadcasts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('line_channel_id')->constrained()->cascadeOnDelete();
            $table->string('title', 50);
            $table->enum('message_type', ['text', 'image'])->default('text');
            $table->longText('text_content')->nullable();
            $table->string('image_url', 1024)->nullable();
            $table->string('image_preview_url', 1024)->nullable();
            $table->enum('target_type', ['all', 'tag'])->default('all');
            $table->foreignId('target_tag_id')->nullable()->constrained('tags')->nullOnDelete();
            $table->enum('status', ['draft', 'scheduled', 'sending', 'sent', 'failed'])->default('draft');
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->unsignedInteger('total_count')->default(0);
            $table->unsignedInteger('success_count')->default(0);
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'status']);
            $table->index(['status', 'scheduled_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('broadcasts');
    }
};
