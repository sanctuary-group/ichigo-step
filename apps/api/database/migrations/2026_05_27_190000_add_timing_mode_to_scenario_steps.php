<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('scenario_steps', function (Blueprint $table) {
            $table->enum('timing_mode', ['immediate', 'datetime', 'elapsed'])
                ->default('elapsed')
                ->after('delay_minutes');
        });
    }

    public function down(): void
    {
        Schema::table('scenario_steps', function (Blueprint $table) {
            $table->dropColumn('timing_mode');
        });
    }
};
