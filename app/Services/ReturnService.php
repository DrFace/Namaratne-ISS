<?php

namespace App\Services;

use App\Models\ReturnModel;
use App\Models\ReturnItem;
use App\Models\Sales;
use App\Models\SalesDetails;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ReturnService
{
    public function __construct(
        protected StockService $stockService
    ) {}

    /**
     * Process a product return.
     */
    public function processReturn(array $data): ReturnModel
    {
        DB::beginTransaction();
        try {
            $sale = Sales::findOrFail($data['sale_id']);
            
            // Create return record
            $return = ReturnModel::create([
                'sale_id' => $sale->id,
                'return_number' => $this->generateReturnNumber(),
                'total_amount' => $data['total_amount'],
                'refund_amount' => $data['refund_amount'],
                'status' => $data['status'] ?? 'completed',
                'reason' => $data['reason'] ?? null,
                'created_by' => $data['created_by'] ?? auth()->id(),
            ]);

            // Create return items and handle restocking
            foreach ($data['items'] as $item) {
                // Validate return quantity
                $this->validateReturnQuantity($sale->id, $item['product_id'], $item['quantity']);

                $returnItem = ReturnItem::create([
                    'return_id' => $return->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'refund_amount' => $item['refund_amount'],
                    'restock' => $item['restock'] ?? true,
                ]);

                // Handle restocking if requested and status is completed/received
                if ($returnItem->restock && in_array($return->status, ['received', 'completed'])) {
                    $this->stockService->addStock([
                        'productId' => $returnItem->product_id,
                        'productCode' => Product::find($returnItem->product_id)->productCode,
                        'quantity' => $returnItem->quantity,
                        'buyingPrice' => Product::find($returnItem->product_id)->buyingPrice, // Keep original buying price
                        'sellingPrice' => Product::find($returnItem->product_id)->sellingPrice, // Keep original selling price
                    ]);
                }
            }

            // Optional: Update sale's paid amount or credit balance if needed
            // This depends on how refunds are handled (cash vs credit)
            
            DB::commit();
            return $return->load('items.product', 'sale');
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Validate that the return quantity does not exceed the sold quantity minus previous returns.
     */
    public function validateReturnQuantity(int $saleId, int $productId, int $quantity): bool
    {
        $soldQuantity = SalesDetails::where('salesId', $saleId)
            ->where('productId', $productId)
            ->sum('quantity');

        $returnedQuantity = ReturnItem::whereHas('return', function ($query) use ($saleId) {
                $query->where('sale_id', $saleId);
            })
            ->where('product_id', $productId)
            ->sum('quantity');

        if (($returnedQuantity + $quantity) > $soldQuantity) {
            throw new \Exception("Return quantity ({$quantity}) exceeds available balance (" . ($soldQuantity - $returnedQuantity) . ") for this product.");
        }

        return true;
    }

    /**
     * Calculate refundable amount for a sale.
     */
    public function calculateRefundableAmount(int $saleId): float
    {
        $sale = Sales::findOrFail($saleId);
        $totalReturned = ReturnModel::where('sale_id', $saleId)->sum('refund_amount');
        
        return max(0, $sale->paidAmount - $totalReturned);
    }

    /**
     * Generate unique return number.
     */
    protected function generateReturnNumber(): string
    {
        $lastReturn = ReturnModel::latest('id')->first();
        $nextId = $lastReturn ? $lastReturn->id + 1 : 1;

        return 'RET-' . date('Ymd') . '-' . str_pad($nextId, 5, '0', STR_PAD_LEFT);
    }
}
