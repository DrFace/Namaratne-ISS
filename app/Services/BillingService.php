<?php

namespace App\Services;

use App\Models\Sales;
use App\Models\SalesDetails;
use App\Models\Product;
use App\Models\Customer;
use Illuminate\Support\Facades\DB;

class BillingService
{
    public function __construct(
        protected StockService $stockService,
        protected CustomerService $customerService
    ) {}

    /**
     * Create a new sale
     */
    public function createSale(array $data): Sales
    {
        DB::beginTransaction();
        try {
            // Generate bill number
            $billNumber = $this->generateBillNumber();

            // Extract products data
            $products = $data['products'] ?? [];
            $productIds = [];
            $totalQuantity = 0;
            $totalAmount = 0;

            // Calculate totals and validate stock
            foreach ($products as $product) {
                $productModel = Product::findOrFail($product['id']);

                // Check stock availability
                if ($productModel->quantity < $product['quantity']) {
                    throw new \Exception("Insufficient stock for product: {$productModel->productName}");
                }

                $productIds[] = $product['id'];
                $totalQuantity += $product['quantity'];
                $totalAmount += $product['quantity'] * $product['price'];
            }

            // Apply discount if present
            $discountValue = $data['discount_value'] ?? 0;
            $finalAmount = $totalAmount - $discountValue;

            // Create sale record
            $sale = Sales::create([
                'customerId' => $data['customerId'],
                'productId' => $productIds,
                'returnProductId' => [],
                'totalQuantity' => $totalQuantity,
                'totalAmount' => $finalAmount,
                'paidAmount' => $data['paidAmount'] ?? 0,
                'dueAmount' => $finalAmount - ($data['paidAmount'] ?? 0),
                'creditAmount' => $data['creditAmount'] ?? 0,
                'cardAmount' => $data['cardAmount'] ?? 0,
                'cashAmount' => $data['cashAmount'] ?? 0,
                'discount_value' => $discountValue,
                'paymentMethod' => $data['paymentMethod'] ?? 'cash',
                'createdBy' => $data['createdBy'] ?? auth()->id(),
                'status' => 'approved',
                'billNumber' => $billNumber,
            ]);

            // Create sales details and reduce stock
            foreach ($products as $product) {
                SalesDetails::create([
                    'salesId'   => $sale->id,
                    'productId' => $product['id'],
                    'quantity'  => $product['quantity'],
                    'salePrice' => $product['price'],
                    'totalAmount' => $product['quantity'] * $product['price'],
                ]);

                // Reduce stock
                $this->stockService->reduceStock($product['id'], $product['quantity']);
            }

            // Handle customer credit if applicable
            if (!empty($data['creditAmount']) && $data['creditAmount'] > 0) {
                $this->customerService->processCreditPurchase(
                    $data['customerId'],
                    $data['creditAmount']
                );
            }

            // Fire sale completed event
            // event(new SaleCompleted($sale));

            DB::commit();
            return $sale->load('customer', 'items');
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Get sale by ID
     */
    public function getSaleById(int $id): ?Sales
    {
        return Sales::with(['customer', 'items.product', 'createdByUser'])
            ->find($id);
    }

    /**
     * Get paginated sales
     */
    public function getPaginatedSales(array $filters = [], int $perPage = 50)
    {
        $query = Sales::with(['customer', 'createdByUser']);

        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('billNumber', 'like', '%' . $filters['search'] . '%')
                  ->orWhereHas('customer', function ($q) use ($filters) {
                      $q->where('name', 'like', '%' . $filters['search'] . '%');
                  });
            });
        }

        if (!empty($filters['customerId'])) {
            $query->where('customerId', $filters['customerId']);
        }

        if (!empty($filters['dateFrom'])) {
            $query->whereDate('created_at', '>=', $filters['dateFrom']);
        }

        if (!empty($filters['dateTo'])) {
            $query->whereDate('created_at', '<=', $filters['dateTo']);
        }

        return $query->latest()->paginate($perPage);
    }

    /**
     * Generate unique bill number
     */
    protected function generateBillNumber(): string
    {
        $lastSale = Sales::latest('id')->first();
        $nextId = $lastSale ? $lastSale->id + 1 : 1;

        return 'INV-' . date('Ymd') . '-' . str_pad($nextId, 5, '0', STR_PAD_LEFT);
    }

    /**
     * Get daily sales summary
     */
    public function getDailySalesSummary($date = null)
    {
        $date = $date ?? now();

        return Sales::whereDate('created_at', $date)
            ->selectRaw('
                COUNT(*) as total_sales,
                SUM(totalAmount) as total_revenue,
                SUM(cashAmount) as cash_sales,
                SUM(creditAmount) as credit_sales,
                SUM(cardAmount) as card_sales
            ')
            ->first();
    }

    /**
     * Get sales by date range
     */
    public function getSalesByDateRange($startDate, $endDate)
    {
        return Sales::with(['customer', 'items'])
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get();
    }

    /**
     * Calculate profit for a sale
     */
    public function calculateSaleProfit(int $saleId): float
    {
        $sale = Sales::with('items.product')->findOrFail($saleId);
        $profit = 0;

        foreach ($sale->items as $item) {
            $buyingPrice = $item->product->buyingPrice;
            $sellingPrice = $item->price;
            $quantity = $item->quantity;

            $profit += ($sellingPrice - $buyingPrice) * $quantity;
        }

        return $profit - ($sale->discount_value ?? 0);
    }
}
