<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('friend_field_folders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('name', 50);
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_system')->default(false);
            $table->timestamps();

            $table->index(['organization_id', 'sort_order']);
        });

        Schema::create('friend_fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('friend_field_folder_id')->nullable()
                ->constrained('friend_field_folders')->nullOnDelete();
            $table->string('name', 50);
            // choice / text / number / date / phone / email
            $table->string('field_type', 20)->default('choice');
            $table->json('options')->nullable();
            // once / repeat
            $table->string('run_mode', 10)->default('once');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['organization_id', 'friend_field_folder_id']);
        });

        Schema::create('friend_field_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('friend_field_id')->constrained()->cascadeOnDelete();
            $table->foreignId('friend_id')->constrained()->cascadeOnDelete();
            $table->text('value')->nullable();
            $table->timestamps();

            $table->unique(['friend_field_id', 'friend_id']);
            $table->index(['organization_id', 'friend_id']);
        });

        foreach (DB::table('organizations')->pluck('id') as $orgId) {
            DB::table('friend_field_folders')->insert([
                'organization_id' => $orgId,
                'name' => '未分類',
                'sort_order' => 0,
                'is_system' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('friend_field_values');
        Schema::dropIfExists('friend_fields');
        Schema::dropIfExists('friend_field_folders');
    }
};
