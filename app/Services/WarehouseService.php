<?php

namespace App\Services;

use App\Models\Warehouse;
use App\Models\WarehouseInventory;
use App\Models\WarehouseTransfer;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class WarehouseService
{
    /**
     * Create a new warehouse
     */
    public function createWarehouse(array $data): Warehouse
    {
        return Warehouse::create([
            'name' => $data['name'],
            'location' => $data['location'] ?? null,
            'contact_number' => $data['contact_number'] ?? null,
            'status' => $data['status'] ?? 'active',
            'is_primary' => $data['is_primary'] ?? false,
        ]);
    }

    /**
     * Adjust stock level for a specific product in a specific warehouse
     */
    public function adjustStock(int $warehouseId, int $productId, float $quantity, string $operation = 'add'): WarehouseInventory
    {
        $inventory = WarehouseInventory::firstOrCreate(
            ['warehouse_id' => $warehouseId, 'product_id' => $productId],
            ['quantity' => 0]
        );

        if ($operation === 'add') {
            $inventory->increment('quantity', $quantity);
        } else {
            if ($inventory->quantity < $quantity) {
                throw new \Exception('Insufficient stock in selected warehouse');
            }
            $inventory->decrement('quantity', $quantity);
        }

        return $inventory;
    }

    /**
     * Initiate a stock transfer between warehouses
     */
    public function initiateTransfer(array $data): WarehouseTransfer
    {
        DB::beginTransaction();
        try {
            // Deduct from source warehouse immediately
            $this->adjustStock($data['from_warehouse_id'], $data['product_id'], $data['quantity'], 'reduce');

            $transfer = WarehouseTransfer::create([
                'transfer_number' => 'TRF-' . strtoupper(Str::random(10)),
                'from_warehouse_id' => $data['from_warehouse_id'],
                'to_warehouse_id' => $data['to_warehouse_id'],
                'product_id' => $data['product_id'],
                'quantity' => $data['quantity'],
                'status' => 'pending',
                'remarks' => $data['remarks'] ?? null,
                'created_by' => auth()->id(),
            ]);

            DB::commit();
            return $transfer;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Complete a pending stock transfer
     */
    public function completeTransfer(int $transferId): WarehouseTransfer
    {
        DB::beginTransaction();
        try {
            $transfer = WarehouseTransfer::findOrFail($transferId);

            if ($transfer->status !== 'pending') {
                throw new \Exception('Transfer cannot be completed from current status: ' . $transfer->status);
            }

            // Add to destination warehouse
            $this->adjustStock($transfer->to_warehouse_id, $transfer->product_id, $transfer->quantity, 'add');

            $transfer->status = 'completed';
            $transfer->save();

            DB::commit();
            return $transfer;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Get stock levels for a product across all warehouses
     */
    public function getProductStockLevels(int $productId)
    {
        return Warehouse::with(['inventory' => function ($query) use ($productId) {
            $query->where('product_id', $productId);
        }])->get();
    }
}
