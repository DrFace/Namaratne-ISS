<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Sales;
use Illuminate\Http\Request;

class GlobalSearchController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->get('q');
        
        if (empty($query) || strlen($query) < 2) {
            return response()->json([
                'products' => [],
                'customers' => [],
                'sales' => []
            ]);
        }

        $products = Product::where('productName', 'like', "%{$query}%")
            ->orWhere('productCode', 'like', "%{$query}%")
            ->limit(5)
            ->get(['id', 'productName', 'productCode', 'quantity', 'sellingPrice']);

        $customers = Customer::where('name', 'like', "%{$query}%")
            ->orWhere('customerId', 'like', "%{$query}%")
            ->orWhere('contactNumber', 'like', "%{$query}%")
            ->limit(5)
            ->get(['id', 'name', 'customerId', 'contactNumber']);

        $sales = Sales::where('billNumber', 'like', "%{$query}%")
            ->limit(5)
            ->get(['id', 'billNumber', 'totalAmount', 'created_at']);

        return response()->json([
            'products' => $products,
            'customers' => $customers,
            'sales' => $sales
        ]);
    }
}
