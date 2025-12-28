<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DiscountCategory extends Model
{
    protected $fillable = [
        'name',
        'type',
        'value',
        'description',
        'status',
    ];

    protected $casts = [
        'value' => 'decimal:2',
    ];

    /**
     * Get all customers with this discount category
     */
    public function customers()
    {
        return $this->hasMany(\App\Models\Customer::class, 'discount_category_id');
    }
}
