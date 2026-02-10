<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Sales;
use App\Models\Customer;
use App\Models\SalesDetails;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardService
{
    /**
     * Get detailed KPI metrics for the dashboard
     */
    public function getDetailedKPIs()
    {
        $today = now()->startOfDay();
        $monthStart = now()->startOfMonth();

        $totalStockValue = Product::whereNotNull('buyingPrice')
            ->where('quantity', '>', 0)
            ->get()
            ->sum(fn($p) => $p->quantity * $p->buyingPrice);

        $todaySales = Sales::whereDate('created_at', $today)
            ->where('status', 'approved')
            ->selectRaw('COUNT(*) as count, COALESCE(SUM(totalAmount), 0) as total')
            ->first();

        $monthProfit = SalesDetails::join('sales', 'sales_details.salesId', '=', 'sales.id')
            ->join('products', 'sales_details.productId', '=', 'products.id')
            ->whereDate('sales.created_at', '>=', $monthStart)
            ->where('sales.status', 'approved')
            ->select('sales_details.quantity', 'sales_details.salePrice', 'products.buyingPrice')
            ->get()
            ->sum(fn($d) => ($d->salePrice - $d->buyingPrice) * $d->quantity);

        return [
            'totalStockValue' => round($totalStockValue, 2),
            'totalProducts' => Product::distinct('productCode')->count('productCode'),
            'lowStockCount' => Product::whereColumn('quantity', '<=', 'lowStock')->where('quantity', '>', 0)->count(),
            'outOfStockCount' => Product::where(fn($q) => $q->where('quantity', 0)->orWhereNull('quantity'))->count(),
            'todaySalesValue' => round($todaySales->total ?? 0, 2),
            'todaySalesCount' => $todaySales->count ?? 0,
            'thisMonthSales' => round(Sales::whereDate('created_at', '>=', $monthStart)->where('status', 'approved')->sum('totalAmount'), 2),
            'thisMonthProfit' => round($monthProfit, 2),
        ];
    }

    /**
     * Get daily sales trend data
     */
    public function getSalesTrend(Carbon $start, Carbon $end)
    {
        $sales = Sales::whereBetween('created_at', [$start, $end])
            ->where('status', 'approved')
            ->selectRaw('DATE(created_at) as date, SUM(totalAmount) as total')
            ->groupBy('date')
            ->pluck('total', 'date')
            ->toArray();

        $labels = [];
        $data = [];
        $cursor = $start->copy();
        
        while ($cursor->lte($end)) {
            $date = $cursor->format('Y-m-d');
            $labels[] = $date;
            $data[] = $sales[$date] ?? 0;
            $cursor->addDay();
        }

        return ['labels' => $labels, 'data' => $data];
    }

    /**
     * Get stock breakdown by category
     */
    public function getStockByCategory()
    {
        return Product::join('serias_numbers', 'products.seriasId', '=', 'serias_numbers.id')
            ->select('serias_numbers.seriasNo as category', DB::raw('SUM(products.quantity) as quantity'))
            ->where('products.quantity', '>', 0)
            ->groupBy('serias_numbers.id', 'serias_numbers.seriasNo')
            ->get()
            ->toArray();
    }

    /**
     * Get top selling products
     */
    public function getTopProducts(Carbon $start, Carbon $end, int $limit = 5)
    {
        return SalesDetails::join('sales', 'sales_details.salesId', '=', 'sales.id')
            ->join('products', 'sales_details.productId', '=', 'products.id')
            ->whereBetween('sales.created_at', [$start, $end])
            ->where('sales.status', 'approved')
            ->select('products.productName', 'products.productCode', DB::raw('SUM(sales_details.quantity) as totalSold'))
            ->groupBy('products.id', 'products.productName', 'products.productCode')
            ->orderByDesc('totalSold')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    /**
     * Get low stock items
     */
    public function getLowStockItems(int $limit = 10)
    {
        return Product::with('serias')
            ->whereColumn('quantity', '<=', 'lowStock')
            ->where('quantity', '>', 0)
            ->orderBy('quantity')
            ->limit($limit)
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'productName' => $p->productName,
                'productCode' => $p->productCode,
                'quantity' => $p->quantity,
                'lowStock' => $p->lowStock,
                'series' => $p->serias->seriasNo ?? 'N/A',
            ])->toArray();
    }

    /**
     * Get out of stock items
     */
    public function getOutOfStockItems(int $limit = 10)
    {
        return Product::with('serias')
            ->where(fn($q) => $q->where('quantity', 0)->orWhereNull('quantity'))
            ->orderBy('updated_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'productName' => $p->productName,
                'productCode' => $p->productCode,
                'series' => $p->serias->seriasNo ?? 'N/A',
                'updated_at' => $p->updated_at,
            ])->toArray();
    }

    /**
     * Get recent transactions
     */
    public function getRecentTransactions(int $limit = 10)
    {
        return Sales::with(['customer', 'createdByUser'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(fn($s) => [
                'id' => $s->id,
                'billNumber' => $s->billNumber,
                'customerName' => $s->customer ? $s->customer->name : 'Walk-in Customer',
                'amount' => $s->totalAmount,
                'paymentMethod' => $s->paymentMethod,
                'status' => $s->status,
                'date' => $s->created_at->format('Y-m-d H:i'),
                'createdBy' => $s->createdByUser ? ($s->createdByUser->first_name . ' ' . $s->createdByUser->last_name) : 'N/A',
            ])->toArray();
    }
}
