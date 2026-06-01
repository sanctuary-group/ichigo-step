<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('line_channels', function (Blueprint $table) {
            // BAN 検知時に自動で切り替える「あらかじめセットした予備チャネル」
            $table->foreignId('fallback_channel_id')->nullable()->after('is_active')
                ->constrained('line_channels')->nullOnDelete();
            // 配布用の固定友だち追加トークン（/add/{token}）。飛び先はクリック時にアクティブ解決。
            $table->string('public_token', 32)->nullable()->unique()->after('fallback_channel_id');
        });

        // 既存チャネルに public_token をバックフィル
        foreach (DB::table('line_channels')->whereNull('public_token')->pluck('id') as $id) {
            DB::table('line_channels')->where('id', $id)->update([
                'public_token' => Str::lower(Str::random(16)),
            ]);
        }
    }

    public function down(): void
    {
        Schema::table('line_channels', function (Blueprint $table) {
            $table->dropConstrainedForeignId('fallback_channel_id');
            $table->dropUnique(['public_token']);
            $table->dropColumn('public_token');
        });
    }
};
