<?php

namespace App\Services;

use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PurchaseOrderService
{
    public function getAllOrders($perPage = 15)
    {
        return PurchaseOrder::with(['supplier', 'creator'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function createOrder(array $data)
    {
        return DB::transaction(function () use ($data) {
            $poNumber = 'PO-' . date('Ymd') . '-' . strtoupper(Str::random(4));
            
            $purchaseOrder = PurchaseOrder::create([
                'po_number' => $poNumber,
                'supplier_id' => $data['supplier_id'],
                'status' => 'draft',
                'order_date' => $data['order_date'],
                'expected_delivery_date' => $data['expected_delivery_date'] ?? null,
                'notes' => $data['notes'] ?? null,
                'created_by' => auth()->id(),
            ]);

            $totalAmount = 0;
            foreach ($data['items'] as $item) {
                $itemTotal = $item['quantity'] * $item['unit_cost'];
                PurchaseOrderItem::create([
                    'purchase_order_id' => $purchaseOrder->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_cost' => $item['unit_cost'],
                    'total_cost' => $itemTotal,
                ]);
                $totalAmount += $itemTotal;
            }

            $purchaseOrder->update(['total_amount' => $totalAmount]);

            return $purchaseOrder->load('items.product');
        });
    }

    public function receiveOrder(int $id)
    {
        return DB::transaction(function () use ($id) {
            $purchaseOrder = PurchaseOrder::with('items.product')->findOrFail($id);

            if ($purchaseOrder->status === 'received') {
                throw new \Exception('This order has already been received.');
            }

            foreach ($purchaseOrder->items as $item) {
                $product = $item->product;
                $product->increment('stock', $item->quantity);
                
                // Track activity
                activity()
                    ->performedOn($product)
                    ->causedBy(auth()->id())
                    ->withProperties([
                        'old_stock' => $product->stock - $item->quantity,
                        'new_stock' => $product->stock,
                        'source' => 'Purchase Order #' . $purchaseOrder->po_number
                    ])
                    ->log('Stock updated via Purchase Order receipt');
            }

            $purchaseOrder->update([
                'status' => 'received',
                'received_by' => auth()->id(),
            ]);

            return $purchaseOrder;
        });
    }

    public function updateStatus(int $id, string $status)
    {
        $order = PurchaseOrder::findOrFail($id);
        $order->update(['status' => $status]);
        return $order;
    }
}
