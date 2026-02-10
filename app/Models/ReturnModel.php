<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ReturnModel extends Model
{
    use SoftDeletes;

    protected $table = 'returns';

    protected $fillable = [
        'sale_id',
        'return_number',
        'total_amount',
        'refund_amount',
        'status',
        'reason',
        'created_by',
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'refund_amount' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'soft_deletes' => 'datetime',
    ];

    /**
     * Get the sale associated with the return.
     */
    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sales::class, 'sale_id');
    }

    /**
     * Get the items for the return.
     */
    public function items(): HasMany
    {
        return $this->hasMany(ReturnItem::class, 'return_id');
    }

    /**
     * Get the user who created the return.
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
