<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WarehouseInventory extends Model
{
    use HasFactory;

    protected $table = 'warehouse_inventory';

    protected $fillable = [
        'warehouse_id',
        'product_id',
        'quantity',
        'low_stock_threshold',
    ];

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
