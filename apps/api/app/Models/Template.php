<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['organization_id', 'template_folder_id', 'name', 'content'])]
class Template extends Model
{
    use BelongsToOrganization;

    public function folder(): BelongsTo
    {
        return $this->belongsTo(TemplateFolder::class, 'template_folder_id');
    }
}
