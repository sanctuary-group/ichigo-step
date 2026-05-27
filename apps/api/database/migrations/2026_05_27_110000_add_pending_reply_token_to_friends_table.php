<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('friends', function (Blueprint $table) {
            $table->string('pending_reply_token')->nullable()->after('metadata');
            $table->timestamp('pending_reply_received_at')->nullable()->after('pending_reply_token');
        });
    }

    public function down(): void
    {
        Schema::table('friends', function (Blueprint $table) {
            $table->dropColumn(['pending_reply_token', 'pending_reply_received_at']);
        });
    }
};
