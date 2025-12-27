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

class BillingController extends Controller
{
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

        return DB::transaction(function () use ($validated) {

            $sale = Sales::create([
                'customerId'    => $validated['customerId'] ?? null,
                'productId'     => collect($validated['cartItems'])->pluck('id'),
                'totalQuantity' => collect($validated['cartItems'])->sum('quantity'),
                'totalAmount'   => $validated['totalAmount'],
                'paidAmount'    => $validated['paidAmount'] ?? 0,
                'dueAmount'     => $validated['totalAmount'] - ($validated['paidAmount'] ?? 0),
                'cashAmount'    => $validated['cashAmount'] ?? 0,
                'cardAmount'    => $validated['cardAmount'] ?? 0,
                'creditAmount'  => $validated['creditAmount'] ?? 0,
                'paymentMethod' => $validated['paymentMethod'],
                'status'        => $validated['status'],
                'billNumber'    => 'BILL-' . time(),
                'createdBy'     => auth()->id(),
            ]);

            if ($validated['status'] === 'approved') {
                foreach ($validated['cartItems'] as $item) {
                    SalesDetails::create([
                        'salesId'        => $sale->id,
                        'productId'      => $item['id'],
                        'quantity'       => $item['quantity'],
                        'salePrice'      => $item['sellingPrice'],
                        'descount'       => 0, // you can calculate per item discount if needed
                        'totalAmount'    => $item['quantity'] * $item['sellingPrice'],
                        'returnQuantity' => 0,
                    ]);

                    Product::where('id', $item['id'])->decrement('quantity', $item['quantity']);
                }

                // Update customer's currentCreditSpend if payment method is credit
                if ($validated['paymentMethod'] === 'credit' && $validated['customerId']) {
                    $customer = Customer::find($validated['customerId']);
                    if ($customer) {
                        $customer->increment('currentCreditSpend', $validated['creditAmount'] ?? 0);
                        // Update credit period status after purchase
                        $customer->refresh();
                        $customer->updateCreditPeriodStatus();
                    }
                }
            }

            return response()->json([
                'message' => $validated['status'] === 'draft'
                    ? 'Draft saved successfully'
                    : 'Sale completed successfully',
                'sale'    => $sale,
            ]);
        });
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

        $customers = Customer::where('contactNumber', 'like', "%$query%")
            ->orWhere('name', 'like', "%$query%")
            ->limit(5)
            ->get(['id', 'name', 'contactNumber', 'email', 'discountValue', 'discountType', 'creditBalance', 'creditLimit', 'currentCreditSpend', 'canPurchase', 'creditPeriodExpiresAt']);

        return response()->json($customers);
    }

    public function invoice($id)
    {
        $sale = Sales::with([
            'items.product:id,productName,productCode',
            'customer:id,name,contactNumber,email,address,vatNumber'
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
            unset($sale->customer);
        }
        
        // Get company VAT number from settings
        $vatNumber = \App\Models\Setting::getSetting('company_vat_number', '');
        
        return Inertia::render('Billing/InvoicePrint', [
            'invoice' => $sale,
            'vatNumber' => $vatNumber,
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
