<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Product extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['productName', 'quantity', 'sellingPrice', 'buyingPrice', 'status'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

   protected $fillable = [
        'productName',
        'productCode',
        'productDescription',
        'productImage',
        'buyingPrice',
        'tax',
        'discount',
        'quantity',
        'unit',
        'brand',
        'sellingPrice',
        'seriasId',
        'supplierId',
        'createdBy',
        'lowStock',
        'reorder_point',
        'profitMargin',
        'batchNumber',
        'status',
        'availability',
        'expiryDate',
        'purchaseDate',
    ];

     protected $casts = [
        'expiryDate'   => 'date',
        'purchaseDate' => 'date',
        'profitMargin' => 'decimal:2',
        'quantity'     => 'integer',
        'buyingPrice'  => 'decimal:2',
        'sellingPrice' => 'decimal:2',
    ];

    // public function scopeFilter($query, array $filters)
    // {
    //     $query->when($filters['search'] ?? false, function ($query, $search) {
    //         $query->where(function ($query) use ($search) {
    //             $query->where('name', 'like', '%' . $search . '%')
    //                 ->orWhere('description', 'like', '%' . $search . '%');
    //         });
    //     });
    // }


    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function serias()
    {
        return $this->belongsTo(SeriasNumber::class);
    }

    /**
     * Get inventory levels across all warehouses
     */
    public function warehouseInventory()
    {
        return $this->hasMany(WarehouseInventory::class);
    }

    /**
     * Get total quantity across all warehouses
     */
    public function getTotalQuantityAttribute()
    {
        return $this->warehouseInventory()->sum('quantity');
    }
}
