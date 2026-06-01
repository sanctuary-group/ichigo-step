<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('short_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('line_channel_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('friend_id')->nullable()->constrained()->nullOnDelete();
            $table->string('token', 16)->unique();
            $table->text('original_url');
            $table->unsignedInteger('click_count')->default(0);
            $table->timestamp('last_clicked_at')->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'created_at']);
            $table->index(['organization_id', 'friend_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('short_links');
    }
};
