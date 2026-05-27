<?php

namespace App\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;

class OrganizationScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        if (! Auth::check()) {
            return;
        }

        $orgId = Auth::user()->current_organization_id;
        if ($orgId === null) {
            return;
        }

        $builder->where($model->getTable().'.organization_id', $orgId);
    }
}
