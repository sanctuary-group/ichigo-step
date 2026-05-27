<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('line_channel_id')->constrained()->cascadeOnDelete();
            $table->foreignId('friend_id')->constrained()->cascadeOnDelete();
            $table->string('line_message_id')->nullable();
            $table->enum('direction', ['incoming', 'outgoing']);
            $table->enum('message_type', ['text', 'image', 'sticker', 'video', 'audio', 'file', 'location', 'flex', 'postback']);
            $table->longText('content');
            $table->enum('source', ['user', 'broadcast', 'scenario', 'auto_reply', 'postback', 'webhook'])->default('webhook');
            $table->unsignedBigInteger('broadcast_id')->nullable();
            $table->unsignedBigInteger('scenario_step_id')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();

            $table->index(['friend_id', 'created_at']);
            $table->index('line_message_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
