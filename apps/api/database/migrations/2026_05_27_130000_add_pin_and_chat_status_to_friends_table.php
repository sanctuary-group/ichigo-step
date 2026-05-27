<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('friends', function (Blueprint $table) {
            $table->timestamp('pinned_at')->nullable()->after('is_hidden');
            $table->enum('chat_status', ['pending', 'in_progress', 'completed'])
                ->nullable()
                ->after('pinned_at');
        });
    }

    public function down(): void
    {
        Schema::table('friends', function (Blueprint $table) {
            $table->dropColumn(['pinned_at', 'chat_status']);
        });
    }
};
