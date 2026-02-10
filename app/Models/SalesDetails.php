<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalesDetails extends Model
{
    use HasFactory;

    protected $fillable = [
        'salesId',
        'productId',
        'quantity',
        'salePrice',
        'discount',
        'totalAmount',
        'returnQuantity',
    ];

    protected $casts = [
        'salePrice' => 'decimal:2',
        'discount' => 'decimal:2',
        'totalAmount' => 'decimal:2',
    ];

    public function sales()
    {
        return $this->belongsTo(Sales::class, 'salesId');
    }

    public function sale()
    {
        return $this->belongsTo(Sales::class, 'salesId');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'productId');
    }


}
