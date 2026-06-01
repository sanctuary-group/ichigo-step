<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('qr_action_folders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('name', 50);
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_system')->default(false);
            $table->timestamps();

            $table->index(['organization_id', 'sort_order']);
        });

        Schema::create('qr_actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->foreignId('line_channel_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('qr_action_folder_id')->nullable()
                ->constrained('qr_action_folders')->nullOnDelete();
            $table->string('token', 40)->unique();
            $table->string('name', 50);
            $table->enum('audience', ['new', 'all'])->default('new');
            $table->enum('action_type', ['none', 'add_tag', 'start_scenario', 'track_source'])->default('track_source');
            $table->foreignId('action_tag_id')->nullable()->constrained('tags')->nullOnDelete();
            $table->foreignId('action_scenario_id')->nullable()->constrained('scenarios')->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('scan_count')->default(0);
            $table->unsignedInteger('follow_count')->default(0);
            $table->timestamps();

            $table->index(['organization_id', 'qr_action_folder_id']);
        });

        foreach (DB::table('organizations')->pluck('id') as $orgId) {
            DB::table('qr_action_folders')->insert([
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
        Schema::dropIfExists('qr_actions');
        Schema::dropIfExists('qr_action_folders');
    }
};
