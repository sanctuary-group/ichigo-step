<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('channel_health_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('line_channel_id')->constrained('line_channels')->cascadeOnDelete();
            $table->unsignedSmallInteger('http_status')->nullable();
            $table->string('error_code', 50)->nullable();
            $table->string('error_message', 500)->nullable();
            $table->enum('risk_level', ['normal', 'warning', 'danger']);
            $table->timestamp('checked_at');
            $table->timestamps();

            $table->index(['line_channel_id', 'checked_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('channel_health_logs');
    }
};
