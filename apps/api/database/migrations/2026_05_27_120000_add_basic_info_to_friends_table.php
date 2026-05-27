<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('friends', function (Blueprint $table) {
            $table->string('system_display_name')->nullable()->after('display_name');
            $table->string('source', 50)->nullable()->after('status_message');
            $table->text('note')->nullable()->after('source');
        });
    }

    public function down(): void
    {
        Schema::table('friends', function (Blueprint $table) {
            $table->dropColumn(['system_display_name', 'source', 'note']);
        });
    }
};
