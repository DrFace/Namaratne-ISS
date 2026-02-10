<?php

namespace App\Services;

use App\Models\Quotation;
use App\Models\QuotationItem;
use App\Models\Sales;
use App\Models\SalesDetails;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class QuotationService
{
    public function __construct(
        protected BillingService $billingService
    ) {}

    /**
     * Create a new quotation
     */
    public function createQuotation(array $data): Quotation
    {
        DB::beginTransaction();
        try {
            // Generate quotation number
            $quotationNumber = $this->generateQuotationNumber();

            // Calculate totals
            $totalAmount = 0;
            foreach ($data['items'] as $item) {
                $totalAmount += $item['quantity'] * $item['unit_price'];
            }

            // Apply discount
            $discountValue = $data['discount_value'] ?? 0;
            $taxAmount = $data['tax_amount'] ?? 0;
            $finalAmount = $totalAmount - $discountValue + $taxAmount;

            // Create quotation
            $quotation = Quotation::create([
                'quotation_number' => $quotationNumber,
                'customer_id' => $data['customer_id'],
                'total_amount' => $finalAmount,
                'discount_value' => $discountValue,
                'tax_amount' => $taxAmount,
                'status' => $data['status'] ?? 'draft',
                'valid_until' => $data['valid_until'] ?? now()->addDays(30),
                'notes' => $data['notes'] ?? null,
                'created_by' => $data['created_by'] ?? auth()->id(),
            ]);

            // Create quotation items
            foreach ($data['items'] as $item) {
                QuotationItem::create([
                    'quotation_id' => $quotation->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'total' => $item['quantity'] * $item['unit_price'],
                ]);
            }

            DB::commit();
            return $quotation->load('items.product', 'customer');
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update an existing quotation
     */
    public function updateQuotation(int $id, array $data): Quotation
    {
        DB::beginTransaction();
        try {
            $quotation = Quotation::findOrFail($id);

            // Can only update draft or sent quotations
            if (!in_array($quotation->status, ['draft', 'sent'])) {
                throw new \Exception('Cannot update quotation with status: ' . $quotation->status);
            }

            // Update quotation details
            $quotation->update([
                'customer_id' => $data['customer_id'] ?? $quotation->customer_id,
                'discount_value' => $data['discount_value'] ?? $quotation->discount_value,
                'tax_amount' => $data['tax_amount'] ?? $quotation->tax_amount,
                'valid_until' => $data['valid_until'] ?? $quotation->valid_until,
                'notes' => $data['notes'] ?? $quotation->notes,
            ]);

            // Update items if provided
            if (isset($data['items'])) {
                // Delete existing items
                $quotation->items()->delete();

                // Create new items
                $totalAmount = 0;
                foreach ($data['items'] as $item) {
                    QuotationItem::create([
                        'quotation_id' => $quotation->id,
                        'product_id' => $item['product_id'],
                        'quantity' => $item['quantity'],
                        'unit_price' => $item['unit_price'],
                        'total' => $item['quantity'] * $item['unit_price'],
                    ]);
                    $totalAmount += $item['quantity'] * $item['unit_price'];
                }

                // Update total
                $finalAmount = $totalAmount - $quotation->discount_value + $quotation->tax_amount;
                $quotation->total_amount = $finalAmount;
                $quotation->save();
            }

            DB::commit();
            return $quotation->fresh()->load('items.product', 'customer');
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Convert quotation to invoice/sale
     */
    public function convertToInvoice(int $quotationId): Sales
    {
        DB::beginTransaction();
        try {
            $quotation = Quotation::with('items.product', 'customer')->findOrFail($quotationId);

            // Check if can be converted
            if (!$quotation->canBeConverted()) {
                throw new \Exception('Quotation cannot be converted. Status: ' . $quotation->status);
            }

            // Prepare sale data from quotation
            $products = [];
            foreach ($quotation->items as $item) {
                $products[] = [
                    'id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'price' => $item->unit_price,
                ];
            }

            $saleData = [
                'customerId' => $quotation->customer_id,
                'products' => $products,
                'discount_value' => $quotation->discount_value,
                'paidAmount' => 0,
                'creditAmount' => 0,
                'cashAmount' => 0,
                'cardAmount' => 0,
                'paymentMethod' => 'pending',
                'createdBy' => auth()->id(),
            ];

            // Create sale using BillingService
            $sale = $this->billingService->createSale($saleData);

            // Update quotation status and link to sale
            $quotation->status = 'converted';
            $quotation->converted_to_sale_id = $sale->id;
            $quotation->save();

            DB::commit();
            return $sale->load('customer', 'salesDetails.product');
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update quotation status
     */
    public function updateStatus(int $id, string $status): Quotation
    {
        $quotation = Quotation::findOrFail($id);

        $validStatuses = ['draft', 'sent', 'approved', 'rejected', 'converted', 'expired'];
        if (!in_array($status, $validStatuses)) {
            throw new \Exception('Invalid status: ' . $status);
        }

        $quotation->status = $status;
        $quotation->save();

        return $quotation;
    }

    /**
     * Delete quotation
     */
    public function deleteQuotation(int $id): bool
    {
        $quotation = Quotation::findOrFail($id);

        // Cannot delete converted quotations
        if ($quotation->status === 'converted') {
            throw new \Exception('Cannot delete converted quotation');
        }

        $quotation->delete();
        return true;
    }

    /**
     * Get quotation by ID with relationships
     */
    public function getQuotationById(int $id): ?Quotation
    {
        return Quotation::with(['customer', 'items.product', 'createdBy', 'convertedSale'])
            ->find($id);
    }

    /**
     * Get paginated quotations with filters
     */
    public function getPaginatedQuotations(array $filters = [], int $perPage = 50)
    {
        $query = Quotation::with(['customer', 'createdBy']);

        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('quotation_number', 'like', '%' . $filters['search'] . '%')
                  ->orWhereHas('customer', function ($q) use ($filters) {
                      $q->where('name', 'like', '%' . $filters['search'] . '%');
                  });
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['customer_id'])) {
            $query->where('customer_id', $filters['customer_id']);
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('created_at', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('created_at', '<=', $filters['date_to']);
        }

        return $query->latest()->paginate($perPage);
    }

    /**
     * Generate unique quotation number
     */
    protected function generateQuotationNumber(): string
    {
        $lastQuotation = Quotation::latest('id')->first();
        $nextId = $lastQuotation ? $lastQuotation->id + 1 : 1;

        return 'QUO-' . date('Ymd') . '-' . str_pad($nextId, 5, '0', STR_PAD_LEFT);
    }
}
