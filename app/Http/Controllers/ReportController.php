<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Inertia\Inertia;

class ReportController extends Controller
{
    /**
     * Display main reports page
     */
    public function index()
    {
        return Inertia::render('Reports/Index');
    }

    /**
     * Generate customer report
     */
    public function customerReport()
    {
        // Get all customers with their total sales
        $customers = Customer::with('discountCategory')
            ->withSum('sales', 'totalAmount')
            ->get()
            ->map(function ($customer) {
                return [
                    'id' => $customer->id,
                    'customerId' => $customer->customerId,
                    'name' => $customer->name,
                    'contactNumber' => $customer->contactNumber,
                    'creditLimit' => $customer->creditLimit,
                    'totalSales' => $customer->sales_sum_totalamount ?? 0,
                ];
            });

        return Inertia::render('Reports/CustomerReport', [
            'customers' => $customers,
            'generatedAt' => now()->format('Y-m-d H:i:s'),
        ]);
    }

    /**
     * Generate payment report
     */
    public function paymentReport()
    {
        // Get date range from request or default to last month
        $startDate = request('start_date', now()->subMonth()->format('Y-m-d'));
        $endDate = request('end_date', now()->format('Y-m-d'));

        // Get all sales with payment details within date range
        $payments = \App\Models\Sales::with('customer:id,customerId,name')
            ->select('id', 'billNumber', 'customerId', 'totalAmount', 'cashAmount', 'cardAmount', 'creditAmount', 'paymentMethod', 'created_at')
            ->whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($sale) {
                return [
                    'id' => $sale->id,
                    'billNumber' => $sale->billNumber,
                    'customerName' => $sale->customer->name ?? 'Walk-in Customer',
                    'customerId' => $sale->customer->customerId ?? '-',
                    'totalAmount' => $sale->totalAmount,
                    'cashAmount' => $sale->cashAmount ?? 0,
                    'cardAmount' => $sale->cardAmount ?? 0,
                    'creditAmount' => $sale->creditAmount ?? 0,
                    'paymentMethod' => ucfirst($sale->paymentMethod),
                    'date' => $sale->created_at->format('Y-m-d H:i'),
                ];
            });

        return Inertia::render('Reports/PaymentReport', [
            'payments' => $payments,
            'generatedAt' => now()->format('Y-m-d H:i:s'),
            'startDate' => $startDate,
            'endDate' => $endDate,
        ]);
    }

    /**
     * Generate inventory report
     */
    public function inventoryReport()
    {
        // Get all products with inventory details
        $inventory = \App\Models\Product::select('id', 'productCode', 'productName', 'batchNumber', 'quantity', 'buyingPrice', 'sellingPrice', 'lowStock', 'status')
            ->orderBy('productName')
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'productCode' => $product->productCode,
                    'productName' => $product->productName,
                    'batchNumber' => $product->batchNumber,
                    'quantity' => $product->quantity,
                    'buyingPrice' => $product->buyingPrice,
                    'sellingPrice' => $product->sellingPrice,
                    'lowStock' => $product->lowStock,
                    'status' => ucfirst($product->status),
                    'stockStatus' => $product->quantity <= $product->lowStock ? 'Low Stock' : 'In Stock',
                ];
            });

        return Inertia::render('Reports/InventoryReport', [
            'inventory' => $inventory,
            'generatedAt' => now()->format('Y-m-d H:i:s'),
        ]);
    }

    /**
     * Generate sales movement report
     */
    public function salesMovementReport()
    {
        // Get date range from request or default to last month
        $startDate = request('start_date', now()->subMonth()->format('Y-m-d'));
        $endDate = request('end_date', now()->format('Y-m-d'));

        // Get all sales details with product information within date range
        $salesMovements = \App\Models\SalesDetails::with(['product:id,productCode,productName', 'sale:id,billNumber,customerId,created_at', 'sale.customer:id,customerId,name'])
            ->whereHas('sale', function ($query) use ($startDate, $endDate) {
                $query->whereDate('created_at', '>=', $startDate)
                      ->whereDate('created_at', '<=', $endDate);
            })
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($detail) {
                return [
                    'id' => $detail->id,
                    'billNumber' => $detail->sale->billNumber ?? '-',
                    'productCode' => $detail->product->productCode ?? '-',
                    'productName' => $detail->product->productName ?? 'Unknown Product',
                    'customerName' => $detail->sale->customer->name ?? 'Walk-in Customer',
                    'customerId' => $detail->sale->customer->customerId ?? '-',
                    'quantity' => $detail->quantity,
                    'salePrice' => $detail->salePrice,
                    'discount' => $detail->descount ?? 0,
                    'totalAmount' => $detail->totalAmount,
                    'date' => $detail->sale->created_at->format('Y-m-d H:i'),
                ];
            });

        return Inertia::render('Reports/SalesMovementReport', [
            'salesMovements' => $salesMovements,
            'generatedAt' => now()->format('Y-m-d H:i:s'),
            'startDate' => $startDate,
            'endDate' => $endDate,
        ]);
    }
}
