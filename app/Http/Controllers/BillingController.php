<?php
namespace App\Http\Controllers;

use App\Http\Requests\Billing\SaleStoreRequest;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Sales;
use App\Models\SalesDetails;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

use App\Services\BillingService;
use App\DTOs\CreateSaleDTO;

class BillingController extends Controller
{
    public function __construct(
        protected BillingService $billingService
    ) {}
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // send all products to page for search/autocomplete
        $products = Product::where('quantity', '>', 0)->get(['id', 'productName', 'sellingPrice', 'quantity', 'productCode']);
        return Inertia::render('Billing/Index', [
            'products' => $products,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    public function store(SaleStoreRequest $request)
    {
        $validated = $request->validated();

        // Check if customer's credit period has expired before allowing credit purchase
        if ($validated['paymentMethod'] === 'credit' && $validated['customerId']) {
            $customer = Customer::find($validated['customerId']);
            
            if ($customer && !$customer->canPurchase) {
                return response()->json([
                    'message' => 'This customer cannot make credit purchases. Credit period has expired. Please settle outstanding credit first.',
                    'error' => 'credit_period_expired'
                ], 403);
            }
        }

        try {
            // Map cartItems to what BillingService expects
            $products = collect($validated['cartItems'])->map(function ($item) {
                return [
                    'id' => $item['id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['sellingPrice']
                ];
            })->toArray();

            $dto = new CreateSaleDTO(
                customerId: (int) $validated['customerId'],
                products: $products,
                paidAmount: (float) ($validated['paidAmount'] ?? 0),
                discount_value: (float) ($validated['discountAmount'] ?? 0),
                creditAmount: (float) ($validated['creditAmount'] ?? 0),
                cardAmount: (float) ($validated['cardAmount'] ?? 0),
                cashAmount: (float) ($validated['cashAmount'] ?? 0),
                paymentMethod: $validated['paymentMethod'],
                createdBy: auth()->id()
            );

            $sale = $this->billingService->createSale($dto->toArray());

            return response()->json([
                'message' => $validated['status'] === 'draft'
                    ? 'Draft saved successfully'
                    : 'Sale completed successfully',
                'sale'    => $sale,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'error' => 'sale_failed'
            ], 422);
        }
    }

    /**
     * Get product details by productName or productCode
     */
    public function search(Request $request)
    {
        $query = $request->get('query');
        if (! $query) {
            return response()->json([]);
        }

        $customers = Customer::with('discountCategory:id,name,type,value')
            ->where('contactNumber', 'like', "%$query%")
            ->orWhere('name', 'like', "%$query%")
            ->limit(5)
            ->get(['id', 'name', 'contactNumber', 'email', 'discount_category_id', 'creditBalance', 'creditLimit', 'currentCreditSpend', 'canPurchase', 'creditPeriodExpiresAt']);

        return response()->json($customers);
    }

    public function invoice($id, Request $request)
    {
        $sale = Sales::with([
            'items.product:id,productName,productCode',
            'customer:id,name,contactNumber,email,address,vatNumber,discount_category_id',
            'customer.discountCategory:id,name,type,value'
        ])->findOrFail($id);
        
        $sale->items->transform(function ($item) {
            $item->productName = $item->product?->productName;
            $item->productCode = $item->product?->productCode;
            unset($item->product);
            return $item;
        });
        
        
        if ($sale->customer) {
            $sale->customer_name = $sale->customer->name;
            $sale->customer_contact = $sale->customer->contactNumber;
            $sale->customer_email = $sale->customer->email;
            $sale->customer_address = $sale->customer->address;
            $sale->customer_vat_number = $sale->customer->vatNumber;
            
            // Add discount category info
            if ($sale->customer->discountCategory) {
                $sale->discount_category_name = $sale->customer->discountCategory->name;
                $sale->discount_category_type = $sale->customer->discountCategory->type;
                $sale->discount_category_value = $sale->customer->discountCategory->value;
            }
            
            unset($sale->customer);
        }
        
        // Get company VAT number from settings
        $vatNumber = \App\Models\Setting::getSetting('company_vat_number', '');
        
        // Get currency from query parameter (default to LKR)
        $currency = strtoupper($request->query('currency', 'LKR'));
        
        // Get exchange rate if USD is requested
        $exchangeRate = null;
        if ($currency === 'USD') {
            $rate = \App\Models\CurrencyRate::getCurrentRate('USD', 'LKR');
            $exchangeRate = $rate ?? 320; // Default to 320 if not set
        }
        
        return Inertia::render('Billing/InvoicePrint', [
            'invoice' => $sale,
            'vatNumber' => $vatNumber,
            'currency' => $currency,
            'exchangeRate' => $exchangeRate,
        ]);
    }

    /**
     * ✅ NEW: View invoice without auto-print + allow PDF download client-side.
     */
    public function invoiceView($id, Request $request)
    {
        // Same data prep as invoice()
        $sale = Sales::with([
            'items.product:id,productName,productCode',
            'customer:id,name,contactNumber,email,address,vatNumber,discount_category_id',
            'customer.discountCategory:id,name,type,value',
            'payments'
        ])->findOrFail($id);

        $sale->items->transform(function ($item) {
            $item->productName = $item->product?->productName;
            $item->productCode = $item->product?->productCode;
            unset($item->product);
            return $item;
        });

        if ($sale->customer) {
            $sale->customer_name = $sale->customer->name;
            $sale->customer_contact = $sale->customer->contactNumber;
            $sale->customer_email = $sale->customer->email;
            $sale->customer_address = $sale->customer->address;
            $sale->customer_vat_number = $sale->customer->vatNumber;

            // Add discount category info
            if ($sale->customer->discountCategory) {
                $sale->discount_category_name = $sale->customer->discountCategory->name;
                $sale->discount_category_type = $sale->customer->discountCategory->type;
                $sale->discount_category_value = $sale->customer->discountCategory->value;
            }

            unset($sale->customer);
        }

        // Get company VAT number from settings
        $vatNumber = \App\Models\Setting::getSetting('company_vat_number', '');

        // Get currency from query parameter (default to LKR)
        $currency = strtoupper($request->query('currency', 'LKR'));

        // Get exchange rate if USD is requested
        $exchangeRate = null;
        if ($currency === 'USD') {
            $rate = \App\Models\CurrencyRate::getCurrentRate('USD', 'LKR');
            $exchangeRate = $rate ?? 320; // Default to 320 if not set
        }

        return Inertia::render('Billing/InvoiceView', [
            'invoice' => $sale,
            'vatNumber' => $vatNumber,
            'currency' => $currency,
            'exchangeRate' => $exchangeRate,
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
