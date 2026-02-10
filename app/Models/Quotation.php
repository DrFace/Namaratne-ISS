<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

class Quotation extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'quotation_number',
        'customer_id',
        'total_amount',
        'discount_value',
        'tax_amount',
        'status',
        'valid_until',
        'notes',
        'created_by',
        'converted_to_sale_id',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'discount_value' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'valid_until' => 'date',
    ];

    /**
     * Get the customer for the quotation
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the items for the quotation
     */
    public function items(): HasMany
    {
        return $this->hasMany(QuotationItem::class);
    }

    /**
     * Get the user who created the quotation
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the sale if converted
     */
    public function convertedSale(): BelongsTo
    {
        return $this->belongsTo(Sales::class, 'converted_to_sale_id');
    }

    /**
     * Scope for active (not expired) quotations
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where(function ($q) {
            $q->whereNull('valid_until')
              ->orWhere('valid_until', '>=', now());
        })->where('status', '!=', 'expired');
    }

    /**
     * Scope for expired quotations
     */
    public function scopeExpired(Builder $query): Builder
    {
        return $query->where('valid_until', '<', now())
            ->where('status', '!=', 'converted');
    }

    /**
     * Scope for converted quotations
     */
    public function scopeConverted(Builder $query): Builder
    {
        return $query->where('status', 'converted');
    }

    /**
     * Check if quotation is expired
     */
    public function isExpired(): bool
    {
        if ($this->status === 'converted' || $this->status === 'expired') {
            return false;
        }

        return $this->valid_until && $this->valid_until->isPast();
    }

    /**
     * Check if quotation can be converted
     */
    public function canBeConverted(): bool
    {
        return in_array($this->status, ['draft', 'sent', 'approved']) 
            && !$this->isExpired();
    }
}
