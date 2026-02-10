<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReportResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Reports often return custom data structures from services/repositories
        // This resource will just passthrough if it's already an array, or allow customization
        return parent::toArray($request);
    }
}
