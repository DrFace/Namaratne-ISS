<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class StockService
{
    /**
     * Add stock to an existing product or create new batch
     */
    public function addStock(array $data): Product
    {
        DB::beginTransaction();
        try {
            $product = Product::where('productCode', $data['productCode'])->first();

            if (!$product) {
                throw new \Exception('Product not found with code: ' . $data['productCode']);
            }

            if (!empty($data['batchNumber'])) {
                $newBatch = Product::create([
                    'productName' => $product->productName,
                    'productCode' => $product->productCode,
                    'productDescription' => $product->productDescription,
                    'productImage' => $product->productImage,
                    'buyingPrice' => $data['buyingPrice'] ?? $product->buyingPrice,
                    'sellingPrice' => $data['sellingPrice'] ?? $product->sellingPrice,
                    'tax' => $product->tax,
                    'discount' => $product->discount,
                    'quantity' => $data['quantity'],
                    'unit' => $product->unit,
                    'brand' => $product->brand,
                    'seriasId' => $product->seriasId,
                    'supplierId' => $data['supplierId'] ?? $product->supplierId,
                    'createdBy' => $data['createdBy'] ?? $product->createdBy,
                    'lowStock' => $product->lowStock,
                    'profitMargin' => $product->profitMargin,
                    'batchNumber' => $data['batchNumber'],
                    'expiryDate' => $data['expiryDate'] ?? null,
                    'purchaseDate' => $data['purchaseDate'] ?? now(),
                    'status' => 'active',
                    'availability' => true,
                ]);

                Cache::forget("product_{$newBatch->id}");

                DB::commit();
                return $newBatch;
            } else {
                // Update existing product stock
                $product->increment('quantity', $data['quantity']);

                // Update other fields if provided
                if (isset($data['buyingPrice'])) {
                    $product->buyingPrice = $data['buyingPrice'];
                }
                if (isset($data['sellingPrice'])) {
                    $product->sellingPrice = $data['sellingPrice'];
                }
                if (isset($data['expiryDate'])) {
                    $product->expiryDate = $data['expiryDate'];
                }
                if (isset($data['purchaseDate'])) {
                    $product->purchaseDate = $data['purchaseDate'];
                }

                $product->save();

                Cache::forget("product_{$product->id}");

                DB::commit();
                return $product;
            }
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Reduce stock for a product (used in sales)
     */
    public function reduceStock(int $productId, int $quantity): bool
    {
        DB::beginTransaction();
        try {
            $product = Product::findOrFail($productId);
            $oldQuantity = $product->quantity;

            if ($product->quantity < $quantity) {
                throw new \Exception('Insufficient stock. Available: ' . $product->quantity . ', Requested: ' . $quantity);
            }

            $product->decrement('quantity', $quantity);

            Cache::forget("product_{$productId}");

            // Dispatch stock updated event
            event(new \App\Events\ProductStockUpdated(
                $product->fresh(),
                $oldQuantity,
                $product->fresh()->quantity,
                'reduced'
            ));

            // Check if stock is now at or below low stock threshold
            if ($product->quantity <= $product->lowStock) {
                event(new \App\Events\LowStockAlert(
                    $product->fresh(),
                    $product->quantity,
                    $product->lowStock
                ));
            }

            // Check if stock is at or below reorder point
            if ($product->quantity <= $product->reorder_point) {
                event(new \App\Events\ReorderLevelReached(
                    $product->fresh(),
                    $product->quantity,
                    $product->reorder_point
                ));
            }

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Transfer stock between batches or products
     */
    public function transferStock(int $fromProductId, int $toProductId, int $quantity): bool
    {
        DB::beginTransaction();
        try {
            $fromProduct = Product::findOrFail($fromProductId);
            $toProduct = Product::findOrFail($toProductId);

            if ($fromProduct->quantity < $quantity) {
                throw new \Exception('Insufficient stock in source product');
            }

            $fromProduct->decrement('quantity', $quantity);
            $toProduct->increment('quantity', $quantity);

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Adjust stock (for inventory corrections)
     */
    public function adjustStock(int $productId, int $newQuantity, string $reason = ''): bool
    {
        DB::beginTransaction();
        try {
            $product = Product::findOrFail($productId);
            $oldQuantity = $product->quantity;

            $product->quantity = $newQuantity;
            $product->save();

            // Log the adjustment (will implement activity log later)
            // activity()
            //     ->performedOn($product)
            //     ->withProperties([
            //         'old_quantity' => $oldQuantity,
            //         'new_quantity' => $newQuantity,
            //         'reason' => $reason
            //     ])
            //     ->log('Stock adjusted');

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Get stock value for a product
     */
    public function getStockValue(int $productId): float
    {
        $product = Product::findOrFail($productId);
        return $product->quantity * $product->buyingPrice;
    }

    /**
     * Get total inventory value
     */
    public function getTotalInventoryValue(): float
    {
        return Product::where('status', 'active')
            ->get()
            ->sum(function ($product) {
                return $product->quantity * $product->buyingPrice;
            });
    }
}
