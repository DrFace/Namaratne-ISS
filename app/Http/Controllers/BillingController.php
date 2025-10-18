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

        return DB::transaction(function () use ($validated) {

            $sale = Sales::create([
                'customerId'    => $validated['customerId'] ?? null,
                'productId'     => collect($validated['cartItems'])->pluck('id'),
                'totalQuantity' => collect($validated['cartItems'])->sum('quantity'),
                'totalAmount'   => $validated['totalAmount'],
                'paidAmount'    => $validated['paidAmount'] ?? 0,
                'dueAmount'     => $validated['totalAmount'] - ($validated['paidAmount'] ?? 0),
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
                        'totalAmount'    => $item['quantity'] * $item['sellingPrice'],
                        'returnQuantity' => 0,
                    ]);

                    Product::where('id', $item['id'])
                        ->decrement('quantity', $item['quantity']);
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
            ->get(['id', 'name', 'contactNumber']);

        return response()->json($customers);
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
