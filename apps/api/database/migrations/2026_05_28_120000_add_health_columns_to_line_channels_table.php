<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('line_channels', function (Blueprint $table) {
            $table->enum('risk_level', ['normal', 'warning', 'danger'])
                ->default('normal')
                ->after('is_active');
            $table->timestamp('last_health_checked_at')->nullable()
                ->after('risk_level');
            $table->string('last_health_error', 500)->nullable()
                ->after('last_health_checked_at');
        });
    }

    public function down(): void
    {
        Schema::table('line_channels', function (Blueprint $table) {
            $table->dropColumn(['risk_level', 'last_health_checked_at', 'last_health_error']);
        });
    }
};
