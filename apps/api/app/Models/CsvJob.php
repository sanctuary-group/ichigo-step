<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'organization_id',
    'kind',
    'name',
    'audience',
    'columns',
    'target_count',
    'condition_label',
    'file_path',
    'original_filename',
    'row_count',
    'status',
])]
class CsvJob extends Model
{
    use BelongsToOrganization;

    protected function casts(): array
    {
        return [
            'columns' => 'array',
            'target_count' => 'integer',
            'row_count' => 'integer',
        ];
    }
}
