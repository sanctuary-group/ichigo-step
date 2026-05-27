<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chat_statuses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
            $table->string('name', 50);
            $table->string('color', 20);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['organization_id', 'sort_order']);
        });

        // seed default statuses for each existing org
        $orgs = DB::table('organizations')->pluck('id');
        $defaults = [
            ['name' => '未対応', 'color' => '#f59e0b'],
            ['name' => '対応中', 'color' => '#3b82f6'],
            ['name' => '完了', 'color' => '#10b981'],
        ];
        foreach ($orgs as $orgId) {
            foreach ($defaults as $i => $d) {
                DB::table('chat_statuses')->insert([
                    'organization_id' => $orgId,
                    'name' => $d['name'],
                    'color' => $d['color'],
                    'sort_order' => $i,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        Schema::table('friends', function (Blueprint $table) {
            $table->foreignId('chat_status_id')
                ->nullable()
                ->after('chat_status')
                ->constrained('chat_statuses')
                ->nullOnDelete();
        });

        // migrate existing enum values to FK
        $mapping = ['pending' => '未対応', 'in_progress' => '対応中', 'completed' => '完了'];
        foreach ($mapping as $enum => $name) {
            DB::table('friends')->where('chat_status', $enum)->orderBy('id')
                ->each(function ($friend) use ($name) {
                    $statusId = DB::table('chat_statuses')
                        ->where('organization_id', $friend->organization_id)
                        ->where('name', $name)
                        ->value('id');
                    if ($statusId) {
                        DB::table('friends')->where('id', $friend->id)
                            ->update(['chat_status_id' => $statusId]);
                    }
                });
        }

        Schema::table('friends', function (Blueprint $table) {
            $table->dropColumn('chat_status');
        });
    }

    public function down(): void
    {
        Schema::table('friends', function (Blueprint $table) {
            $table->enum('chat_status', ['pending', 'in_progress', 'completed'])
                ->nullable()
                ->after('pinned_at');
            $table->dropForeign(['chat_status_id']);
            $table->dropColumn('chat_status_id');
        });

        Schema::dropIfExists('chat_statuses');
    }
};
