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
        'descount',
        'totalAmount',
        'returnQuantity',
    ];

    protected $casts = [
        'salePrice' => 'decimal:2',
        'descount' => 'decimal:2',
        'totalAmount' => 'decimal:2',
    ];

    public function sales()
    {
        return $this->belongsTo(Sales::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }


}
