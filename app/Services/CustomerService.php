<?php

namespace App\Services;

use App\Models\Customer;
use App\Events\CustomerCreditExceeded;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class CustomerService
{
    /**
     * Get paginated customers with filters
     */
    public function getPaginatedCustomers(array $filters = [], int $perPage = 50)
    {
        $query = Customer::with('discountCategory');

        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('customerId', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('email', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('contactNumber', 'like', '%' . $filters['search'] . '%');
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->latest()->paginate($perPage);
    }

    public function createCustomer(array $data): Customer
    {
        DB::beginTransaction();
        try {
            $customer = Customer::create($data);

            $this->clearCustomerCache($customer->id);

            DB::commit();
            return $customer;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function updateCustomer(int $id, array $data): Customer
    {
        DB::beginTransaction();
        try {
            $customer = Customer::findOrFail($id);
            $customer->update($data);

            // Update credit period status if credit-related fields changed
            if (isset($data['creditLimit']) || isset($data['creditPeriod']) || isset($data['currentCreditSpend'])) {
                $customer->updateCreditPeriodStatus();
            }

            $this->clearCustomerCache($id);

            DB::commit();
            return $customer->fresh();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Delete a customer
     */
    public function deleteCustomer(int $id): bool
    {
        DB::beginTransaction();
        try {
            $customer = Customer::findOrFail($id);

            // Check if customer has outstanding balance
            $customer->delete();

            $this->clearCustomerCache($id);

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Get customer by ID
     */
    public function getCustomerById(int $id): ?Customer
    {
        return Cache::remember("customer_{$id}", now()->addHours(1), function () use ($id) {
            return Customer::with('discountCategory', 'sales')->find($id);
        });
    }

    /**
     * Clear customer cache
     */
    protected function clearCustomerCache(int $id): void
    {
        Cache::forget("customer_{$id}");
        Cache::forget("customer_transactions_{$id}");
    }

    /**
     * Search customers
     */
    public function searchCustomers(string $query)
    {
        return Customer::where('name', 'like', '%' . $query . '%')
            ->orWhere('customerId', 'like', '%' . $query . '%')
            ->orWhere('contactNumber', 'like', '%' . $query . '%')
            ->limit(10)
            ->get();
    }

    /**
     * Process credit purchase
     */
    public function processCreditPurchase(int $customerId, float $amount): bool
    {
        DB::beginTransaction();
        try {
            $customer = Customer::findOrFail($customerId);

            // Check if customer can purchase
            if (!$customer->canPurchase) {
                throw new \Exception('Customer credit period has expired. Cannot make credit purchases.');
            }

            // Add to credit spend
            $customer->currentCreditSpend += $amount;
            $customer->creditBalance += $amount;
            $customer->netBalance = $customer->creditBalance;

            $customer->save();

            $this->clearCustomerCache($customerId);

            // Fire event if credit exceeded
            if ($customer->currentCreditSpend > $customer->creditLimit) {
                event(new CustomerCreditExceeded($customer, $customer->currentCreditSpend - $customer->creditLimit));
            }

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Settle customer credit
     */
    public function settleCredit(int $customerId, float $amount): bool
    {
        DB::beginTransaction();
        try {
            $customer = Customer::findOrFail($customerId);

            if ($amount > $customer->creditBalance) {
                throw new \Exception('Settlement amount exceeds credit balance');
            }

            $customer->creditBalance -= $amount;
            $customer->currentCreditSpend -= $amount;
            $customer->netBalance = $customer->creditBalance;

            $customer->save();

            $this->clearCustomerCache($customerId);

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Get customers with expired credit periods
     */
    public function getExpiredCreditCustomers()
    {
        return Customer::whereNotNull('creditPeriodExpiresAt')
            ->where('creditPeriodExpiresAt', '<', now())
            ->where('creditBalance', '>', 0)
            ->get();
    }

    /**
     * Get customers approaching credit limit
     */
    public function getCustomersApproachingLimit(float $threshold = 0.8)
    {
        return Customer::where('currentCreditSpend', '>', DB::raw('creditLimit * ' . $threshold))
            ->where('currentCreditSpend', '<', DB::raw('creditLimit'))
            ->get();
    }

    /**
     * Get customer transaction history
     */
    public function getTransactionHistory(int $customerId)
    {
        return Cache::remember("customer_transactions_{$customerId}", now()->addMinutes(30), function () use ($customerId) {
            $customer = Customer::with(['sales' => function ($query) {
                $query->orderBy('created_at', 'desc');
            }])->findOrFail($customerId);

            return $customer->sales;
        });
    }
}
