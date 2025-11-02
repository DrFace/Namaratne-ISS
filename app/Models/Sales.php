<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Sales extends Model
{
    use HasFactory;

    protected $fillable = [
        'customerId',
        'productId',
        'returnProductId',
        'totalQuantity',
        'totalAmount',
        'paidAmount',
        'dueAmount',
        'creditAmount',
        'cardAmount',
        'cashAmount',
        'paymentMethod',
        'createdBy',
        'status',
        'billNumber',
    ];
      protected $casts = [
        'productId' => 'array',
        'returnProductId' => 'array',
        'totalAmount' => 'decimal:2',
        'paidAmount' => 'decimal:2',
        'dueAmount' => 'decimal:2',
        'creditAmount' => 'decimal:2',
        'cardAmount' => 'decimal:2',
        'cashAmount' => 'decimal:2',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customerId');
    }

    public function salesDetails()
    {
        return $this->hasMany(SalesDetails::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'createdBy');
    }
    public function createdByUser()
    {
        return $this->belongsTo(User::class, 'createdBy', 'id');
    }
    public function items()
    {
        return $this->hasMany(SalesDetails::class, 'salesId');
    }
}
