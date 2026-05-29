<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'organization_id',
    'line_channel_id',
    'rich_menu_folder_id',
    'name',
    'chat_bar_text',
    'layout_key',
    'size',
    'image_path',
    'areas',
    'is_published',
    'line_rich_menu_id',
    'published_at',
])]
class RichMenu extends Model
{
    use BelongsToOrganization;

    protected function casts(): array
    {
        return [
            'areas' => 'array',
            'is_published' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    public function lineChannel(): BelongsTo
    {
        return $this->belongsTo(LineChannel::class);
    }

    public function folder(): BelongsTo
    {
        return $this->belongsTo(RichMenuFolder::class, 'rich_menu_folder_id');
    }
}
