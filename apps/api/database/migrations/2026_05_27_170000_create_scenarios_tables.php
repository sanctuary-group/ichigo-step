<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scenarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('line_channel_id')->constrained('line_channels')->cascadeOnDelete();
            $table->string('name', 100);
            $table->string('description', 500)->nullable();
            $table->enum('trigger_type', ['friend_add', 'tag_added'])->default('friend_add');
            $table->foreignId('trigger_tag_id')->nullable()
                ->constrained('tags')->nullOnDelete();
            $table->boolean('is_active')->default(false);
            $table->timestamps();

            $table->index(['organization_id', 'is_active']);
            $table->index(['trigger_type', 'trigger_tag_id']);
        });

        Schema::create('scenario_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('scenario_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('step_order');
            $table->unsignedInteger('delay_minutes')->default(0);
            $table->enum('message_type', ['text', 'image'])->default('text');
            $table->text('text_content')->nullable();
            $table->string('image_url', 1024)->nullable();
            $table->string('image_preview_url', 1024)->nullable();
            $table->timestamps();

            $table->unique(['scenario_id', 'step_order']);
        });

        Schema::create('friend_scenarios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('friend_id')->constrained()->cascadeOnDelete();
            $table->foreignId('scenario_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('current_step_order')->default(0);
            $table->enum('status', ['active', 'paused', 'completed', 'delivering', 'failed'])
                ->default('active');
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('next_delivery_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->string('error_message', 500)->nullable();
            $table->timestamps();

            $table->unique(['friend_id', 'scenario_id']);
            $table->index(['status', 'next_delivery_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('friend_scenarios');
        Schema::dropIfExists('scenario_steps');
        Schema::dropIfExists('scenarios');
    }
};
