<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('friend_tag', function (Blueprint $table) {
            $table->foreignId('friend_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained()->cascadeOnDelete();
            $table->timestamp('assigned_at')->useCurrent();

            $table->primary(['friend_id', 'tag_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('friend_tag');
    }
};
