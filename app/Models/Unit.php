<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Unit extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'short_name',
        'base_unit_id',
        'operator',
        'operator_value',
    ];

    /**
     * Get the base unit this unit belongs to.
     */
    public function baseUnit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'base_unit_id');
    }

    /**
     * Get the sub units defined based on this unit.
     */
    public function subUnits(): HasMany
    {
        return $this->hasMany(Unit::class, 'base_unit_id');
    }

    /**
     * Convert a quantity from this unit to the base unit.
     */
    public function convertToBase(float $quantity): float
    {
        if (!$this->base_unit_id || !$this->operator || !$this->operator_value) {
            return $quantity;
        }

        return $this->operator === 'multiply' 
            ? $quantity * $this->operator_value 
            : $quantity / $this->operator_value;
    }

    /**
     * Convert a quantity from the base unit to this unit.
     */
    public function convertFromBase(float $quantity): float
    {
        if (!$this->base_unit_id || !$this->operator || !$this->operator_value) {
            return $quantity;
        }

        return $this->operator === 'multiply' 
            ? $quantity / $this->operator_value 
            : $quantity * $this->operator_value;
    }
}
