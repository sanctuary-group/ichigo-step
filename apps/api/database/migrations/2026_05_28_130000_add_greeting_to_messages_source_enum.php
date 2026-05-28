<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE messages MODIFY source ENUM('user','broadcast','scenario','auto_reply','postback','webhook','greeting') NOT NULL DEFAULT 'webhook'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE messages MODIFY source ENUM('user','broadcast','scenario','auto_reply','postback','webhook') NOT NULL DEFAULT 'webhook'");
    }
};
