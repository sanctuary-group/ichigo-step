<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'organization_id',
    'name',
    'basic_id',
    'channel_id',
    'channel_secret',
    'channel_access_token',
    'liff_id',
    'is_active',
])]
#[Hidden(['channel_secret', 'channel_access_token'])]
class LineChannel extends Model
{
    use BelongsToOrganization;

    protected function casts(): array
    {
        return [
            'channel_secret' => 'encrypted',
            'channel_access_token' => 'encrypted',
            'is_active' => 'boolean',
        ];
    }
}
