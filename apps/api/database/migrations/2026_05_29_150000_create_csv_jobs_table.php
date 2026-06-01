<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('csv_jobs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            // export / import
            $table->string('kind', 10);
            $table->string('name', 50);
            // export: active / blocked / blockedBy
            $table->string('audience', 20)->nullable();
            // export: 選択された出力カラム
            $table->json('columns')->nullable();
            $table->unsignedInteger('target_count')->default(0);
            // 最終条件設定の表示ラベル
            $table->string('condition_label', 100)->nullable();
            // 生成された CSV の保存パス（export）/ アップロードファイル（import）
            $table->string('file_path')->nullable();
            $table->string('original_filename')->nullable();
            $table->unsignedInteger('row_count')->default(0);
            // pending / processing / completed / failed
            $table->string('status', 12)->default('completed');
            $table->timestamps();

            $table->index(['organization_id', 'kind', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('csv_jobs');
    }
};
