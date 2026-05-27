<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('template_folders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('name', 50);
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_system')->default(false);
            $table->timestamps();

            $table->index(['organization_id', 'sort_order']);
        });

        Schema::create('templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('template_folder_id')
                ->nullable()
                ->constrained('template_folders')
                ->nullOnDelete();
            $table->string('name', 50);
            $table->text('content');
            $table->timestamps();

            $table->index(['organization_id', 'template_folder_id']);
        });

        // seed default "未分類" folder for each existing organization
        foreach (DB::table('organizations')->pluck('id') as $orgId) {
            DB::table('template_folders')->insert([
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
        Schema::dropIfExists('templates');
        Schema::dropIfExists('template_folders');
    }
};
