<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('form_folders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('name', 50);
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_system')->default(false);
            $table->timestamps();

            $table->index(['organization_id', 'sort_order']);
        });

        Schema::create('forms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('line_channel_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('form_folder_id')->nullable()
                ->constrained('form_folders')->nullOnDelete();
            $table->string('token', 40)->unique();
            $table->string('name', 100);
            $table->string('title', 150);
            $table->text('description')->nullable();
            $table->string('form_type', 20)->default('standard'); // standard / survey / reservation
            $table->enum('status', ['draft', 'published', 'closed'])->default('draft');
            $table->string('submit_message', 500)->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'form_folder_id']);
        });

        Schema::create('form_fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('sort_order')->default(0);
            $table->string('label', 200);
            // text / textarea / radio / checkbox / select / email / number / date
            $table->string('type', 20);
            $table->json('options')->nullable();
            $table->boolean('required')->default(false);
            $table->timestamps();

            $table->index(['form_id', 'sort_order']);
        });

        Schema::create('form_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('form_id')->constrained()->cascadeOnDelete();
            $table->foreignId('friend_id')->nullable()->constrained()->nullOnDelete();
            $table->json('answers');
            $table->timestamp('submitted_at');
            $table->timestamps();

            $table->index(['form_id', 'submitted_at']);
        });

        foreach (DB::table('organizations')->pluck('id') as $orgId) {
            DB::table('form_folders')->insert([
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
        Schema::dropIfExists('form_responses');
        Schema::dropIfExists('form_fields');
        Schema::dropIfExists('forms');
        Schema::dropIfExists('form_folders');
    }
};
