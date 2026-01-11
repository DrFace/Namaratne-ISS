<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'customerId',
        'name',
        'contactNumber',
        'email',
        'address',
        'vatNumber',
        'discount_category_id',
        'creditLimit',
        'creditPeriod',
        'currentCreditSpend',
        'netBalance',
        'cashBalance',
        'creditBalance',
        'cardBalance',
        'totalBalance',
        'status',
        'availability',
        'creditLimitReachedAt',
        'creditPeriodExpiresAt',
        'canPurchase',
    ];

    protected $casts = [
        'availability'            => 'boolean',
        'creditLimit'             => 'decimal:2',
        'currentCreditSpend'      => 'decimal:2',
        'netBalance'              => 'decimal:2',
        'cashBalance'             => 'decimal:2',
        'creditBalance'           => 'decimal:2',
        'cardBalance'             => 'decimal:2',
        'totalBalance'            => 'decimal:2',
        'creditLimitReachedAt'    => 'datetime',
        'creditPeriodExpiresAt'   => 'datetime',
        'canPurchase'             => 'boolean',
    ];

    /**
     * Get the discount category for this customer
     */
    public function discountCategory()
    {
        return $this->belongsTo(\App\Models\DiscountCategory::class);
    }

    /**
     * Get all sales for this customer
     */
    public function sales()
    {
        return $this->hasMany(\App\Models\Sales::class, 'customerId', 'id');
    }

    /**
     * Check if the customer is active and available
     */
    public function getIsActiveAttribute()
    {
        return $this->status === 'active' && $this->availability === true;
    }

    protected static function booted()
    {
        static::creating(function ($customer) {
            if (empty($customer->customerId)) {
                $lastId               = self::latest('id')->value('id') ?? 0;
                $customer->customerId = 'CUST' . str_pad($lastId + 1, 6, '0', STR_PAD_LEFT);
            }

            $customer->creditBalance = $customer->creditBalance ?? 0;
            $customer->netBalance    = $customer->creditBalance;

        });
    }

    public function reduceCreditBalance(float $amount)
    {
        $this->creditBalance -= $amount;
        $this->netBalance = $this->creditBalance;
        $this->save();
    }

    /**
     * Increase creditBalance (e.g., adding credit)
     */
    public function addCreditBalance(float $amount)
    {
        $this->creditBalance += $amount;
        $this->netBalance = $this->creditBalance;
        $this->save();
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Check if credit period has expired
     */
    public function getIsCreditPeriodExpiredAttribute()
    {
        if (!$this->creditPeriodExpiresAt) {
            return false;
        }
        
        return now()->gt($this->creditPeriodExpiresAt);
    }

    /**
     * Get days remaining or overdue for credit period
     */
    public function getCreditPeriodDaysAttribute()
    {
        if (!$this->creditPeriodExpiresAt) {
            return null;
        }
        
        $days = now()->diffInDays($this->creditPeriodExpiresAt, false);
        return (int) $days;
    }

    /**
     * Update credit period status based on current balance and dates
     */
    public function updateCreditPeriodStatus()
    {
        // If customer has no credit, reset everything
        if ($this->currentCreditSpend == 0) {
            $this->creditLimitReachedAt = null;
            $this->creditPeriodExpiresAt = null;
            $this->canPurchase = true;
            $this->save();
            return;
        }

        // If customer exceeded limit and period not set yet
        if ($this->currentCreditSpend > $this->creditLimit && !$this->creditLimitReachedAt) {
            $this->creditLimitReachedAt = now();
            
            // Calculate expiration date
            $days = (int) str_replace(' days', '', $this->creditPeriod);
            $this->creditPeriodExpiresAt = now()->addDays($days);
        }

        // Check if period has expired
        if ($this->creditPeriodExpiresAt && now()->gt($this->creditPeriodExpiresAt)) {
            $this->canPurchase = false;
        } else {
            $this->canPurchase = true;
        }

        $this->save();
    }
}
