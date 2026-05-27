<?php

namespace App\Models\Concerns;

use App\Models\Organization;
use App\Scopes\OrganizationScope;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

trait BelongsToOrganization
{
    public static function bootBelongsToOrganization(): void
    {
        static::addGlobalScope(new OrganizationScope);

        static::creating(function ($model) {
            if ($model->organization_id !== null) {
                return;
            }
            if (Auth::check() && Auth::user()->current_organization_id) {
                $model->organization_id = Auth::user()->current_organization_id;
            }
        });
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }
}
