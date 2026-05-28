<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scenario_folders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('name', 50);
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_system')->default(false);
            $table->timestamps();

            $table->index(['organization_id', 'sort_order']);
        });

        // 既存組織に「未分類」フォルダを seed
        foreach (DB::table('organizations')->pluck('id') as $orgId) {
            DB::table('scenario_folders')->insert([
                'organization_id' => $orgId,
                'name' => '未分類',
                'sort_order' => 0,
                'is_system' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        Schema::table('scenarios', function (Blueprint $table) {
            $table->foreignId('scenario_folder_id')->nullable()->after('line_channel_id')
                ->constrained('scenario_folders')->nullOnDelete();
        });

        // 既存シナリオを各組織の「未分類」に割り当て
        $defaults = DB::table('scenario_folders')
            ->where('is_system', true)
            ->pluck('id', 'organization_id');
        foreach ($defaults as $orgId => $folderId) {
            DB::table('scenarios')
                ->where('organization_id', $orgId)
                ->whereNull('scenario_folder_id')
                ->update(['scenario_folder_id' => $folderId]);
        }
    }

    public function down(): void
    {
        Schema::table('scenarios', function (Blueprint $table) {
            $table->dropForeign(['scenario_folder_id']);
            $table->dropColumn('scenario_folder_id');
        });
        Schema::dropIfExists('scenario_folders');
    }
};
