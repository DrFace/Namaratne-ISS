<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\StockService;
use App\Services\BillingService;
use App\Models\Product;
use App\Models\Sales;
use App\Http\Resources\V1\ReportResource;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct(
        protected StockService $stockService,
        protected BillingService $billingService
    ) {}

    /**
     * Get inventory report
     */
    public function inventory(Request $request)
    {
        $totalValue = $this->stockService->getTotalInventoryValue();
        $lowStockCount = Product::whereRaw('quantity <= lowStock')->count();
        $outOfStockCount = Product::where('quantity', 0)->count();
        $totalProducts = Product::where('status', 'active')->count();

        return new ReportResource([
            'total_inventory_value' => $totalValue,
            'total_products' => $totalProducts,
            'low_stock_items' => $lowStockCount,
            'out_of_stock_items' => $outOfStockCount,
        ]);
    }

    /**
     * Get sales report
     */
    public function sales(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth());
        $endDate = $request->input('end_date', now());

        $sales = $this->billingService->getSalesByDateRange($startDate, $endDate);

        $totalSales = $sales->sum('totalAmount');
        $totalTransactions = $sales->count();
        $averageTransaction = $totalTransactions > 0 ? $totalSales / $totalTransactions : 0;

        return new ReportResource([
            'period' => [
                'start' => $startDate,
                'end' => $endDate
            ],
            'total_sales' => $totalSales,
            'total_transactions' => $totalTransactions,
            'average_transaction_value' => $averageTransaction,
            'sales' => $sales
        ]);
    }

    /**
     * Get profit report
     */
    public function profit(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth());
        $endDate = $request->input('end_date', now());

        $sales = Sales::with('items.product')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->get();

        $totalRevenue = $sales->sum('totalAmount');
        $totalProfit = 0;

        foreach ($sales as $sale) {
            $totalProfit += $this->billingService->calculateSaleProfit($sale->id);
        }

        $profitMargin = $totalRevenue > 0 ? ($totalProfit / $totalRevenue) * 100 : 0;

        return new ReportResource([
            'period' => [
                'start' => $startDate,
                'end' => $endDate
            ],
            'total_revenue' => $totalRevenue,
            'total_profit' => $totalProfit,
            'profit_margin_percentage' => round($profitMargin, 2),
            'total_transactions' => $sales->count()
        ]);
    }
}
