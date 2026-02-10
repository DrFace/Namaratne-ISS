<?php

namespace App\Http\Controllers;

use App\Services\PurchaseOrderService;
use App\Models\Supplier;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PurchaseOrderController extends Controller
{
    protected $poService;

    public function __construct(PurchaseOrderService $poService)
    {
        $this->poService = $poService;
    }

    public function index()
    {
        return Inertia::render('PurchaseOrder/Index', [
            'orders' => $this->poService->getAllOrders(),
        ]);
    }

    public function create()
    {
        return Inertia::render('PurchaseOrder/Create', [
            'suppliers' => Supplier::all(),
            'products' => Product::all(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'order_date' => 'required|date',
            'expected_delivery_date' => 'nullable|date',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_cost' => 'required|numeric|min:0',
        ]);

        $this->poService->createOrder($data);

        return redirect()->route('purchase-orders.index')->with('success', 'Purchase Order created successfully.');
    }

    public function show($id)
    {
        $order = \App\Models\PurchaseOrder::with(['supplier', 'items.product', 'creator', 'receiver'])->findOrFail($id);
        
        return Inertia::render('PurchaseOrder/Show', [
            'order' => $order,
        ]);
    }

    public function receive($id)
    {
        try {
            $this->poService->receiveOrder($id);
            return back()->with('success', 'Order received and inventory updated.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function print($id)
    {
        $order = \App\Models\PurchaseOrder::with(['supplier', 'items.product'])->findOrFail($id);
        
        return view('purchase-orders.print', compact('order'));
    }
}
