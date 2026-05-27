<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['organization_id', 'name', 'color', 'sort_order'])]
class ChatStatus extends Model
{
    use BelongsToOrganization;

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
        ];
    }
}
