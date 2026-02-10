<?php

namespace App\Services;

use App\Models\Sales;
use App\Models\Product;
use App\Models\Customer;
use Illuminate\Support\Facades\DB;

class ReportService
{
    /**
     * Get inventory analytics
     */
    public function getInventoryAnalytics(): array
    {
        $totalProducts = Product::where('status', 'active')->count();
        $totalValue = DB::table('products')
            ->where('status', 'active')
            ->selectRaw('SUM(quantity * buyingPrice) as total')
            ->value('total') ?? 0;

        $lowStockProducts = Product::whereRaw('quantity <= lowStock')
            ->where('status', 'active')
            ->count();

        $outOfStockProducts = Product::where('quantity', 0)
            ->where('status', 'active')
            ->count();

        $expiringProducts = Product::where('expiryDate', '<=', now()->addDays(30))
            ->where('expiryDate', '>', now())
            ->count();

        return [
            'total_products' => $totalProducts,
            'total_inventory_value' => round($totalValue, 2),
            'low_stock_count' => $lowStockProducts,
            'out_of_stock_count' => $outOfStockProducts,
            'expiring_soon_count' => $expiringProducts,
        ];
    }

    /**
     * Get sales analytics for a date range
     */
    public function getSalesAnalytics($startDate = null, $endDate = null): array
    {
        $startDate = $startDate ?? now()->startOfMonth();
        $endDate = $endDate ?? now();

        $sales = Sales::whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'approved')
            ->get();

        $totalSales = $sales->sum('totalAmount');
        $totalTransactions = $sales->count();
        $averageTransaction = $totalTransactions > 0 ? $totalSales / $totalTransactions : 0;

        $cashSales = $sales->where('paymentMethod', 'cash')->sum('totalAmount');
        $creditSales = $sales->where('paymentMethod', 'credit')->sum('totalAmount');
        $cardSales = $sales->where('paymentMethod', 'card')->sum('totalAmount');

        return [
            'period' => [
                'start' => $startDate,
                'end' => $endDate,
            ],
            'total_sales' => round($totalSales, 2),
            'total_transactions' => $totalTransactions,
            'average_transaction' => round($averageTransaction, 2),
            'payment_breakdown' => [
                'cash' => round($cashSales, 2),
                'credit' => round($creditSales, 2),
                'card' => round($cardSales, 2),
            ],
        ];
    }

    /**
     * Get profit analytics
     */
    public function getProfitAnalytics($startDate = null, $endDate = null): array
    {
        $startDate = $startDate ?? now()->startOfMonth();
        $endDate = $endDate ?? now();

        $sales = Sales::with('salesDetails.product')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'approved')
            ->get();

        $totalRevenue = 0;
        $totalCost = 0;
        $totalProfit = 0;

        foreach ($sales as $sale) {
            $totalRevenue += $sale->totalAmount;

            foreach ($sale->salesDetails as $detail) {
                if ($detail->product) {
                    $itemCost = $detail->product->buyingPrice * $detail->quantity;
                    $totalCost += $itemCost;
                }
            }
        }

        $totalProfit = $totalRevenue - $totalCost;
        $profitMargin = $totalRevenue > 0 ? ($totalProfit / $totalRevenue) * 100 : 0;

        return [
            'period' => [
                'start' => $startDate,
                'end' => $endDate,
            ],
            'total_revenue' => round($totalRevenue, 2),
            'total_cost' => round($totalCost, 2),
            'total_profit' => round($totalProfit, 2),
            'profit_margin_percentage' => round($profitMargin, 2),
            'total_transactions' => $sales->count(),
        ];
    }

    /**
     * Get top selling products
     */
    public function getTopSellingProducts(int $limit = 10, $startDate = null, $endDate = null): array
    {
        $startDate = $startDate ?? now()->startOfMonth();
        $endDate = $endDate ?? now();

        $topProducts = DB::table('sales_details')
            ->join('sales', 'sales_details.salesId', '=', 'sales.id')
            ->join('products', 'sales_details.productId', '=', 'products.id')
            ->whereBetween('sales.created_at', [$startDate, $endDate])
            ->where('sales.status', 'approved')
            ->select(
                'products.id',
                'products.productName',
                'products.productCode',
                DB::raw('SUM(sales_details.quantity) as total_quantity'),
                DB::raw('SUM(sales_details.amount) as total_revenue')
            )
            ->groupBy('products.id', 'products.productName', 'products.productCode')
            ->orderByDesc('total_quantity')
            ->limit($limit)
            ->get();

        return $topProducts->toArray();
    }

    /**
     * Get customer analytics
     */
    public function getCustomerAnalytics(): array
    {
        $totalCustomers = Customer::count();
        $activeCustomers = Customer::where('status', 'active')->count();
        
        $customersWithCredit = Customer::where('currentCreditSpend', '>', 0)->count();
        $totalCreditOutstanding = Customer::sum('currentCreditSpend');

        $topCustomers = DB::table('customers')
            ->join('sales', 'customers.id', '=', 'sales.customerId')
            ->select(
                'customers.id',
                'customers.name',
                DB::raw('SUM(sales.totalAmount) as total_purchases'),
                DB::raw('COUNT(sales.id) as transaction_count')
            )
            ->groupBy('customers.id', 'customers.name')
            ->orderByDesc('total_purchases')
            ->limit(10)
            ->get();

        return [
            'total_customers' => $totalCustomers,
            'active_customers' => $activeCustomers,
            'customers_with_credit' => $customersWithCredit,
            'total_credit_outstanding' => round($totalCreditOutstanding, 2),
            'top_customers' => $topCustomers->toArray(),
        ];
    }

    /**
     * Get ABC analysis (Pareto analysis) for inventory
     */
    public function getABCAnalysis(): array
    {
        $products = DB::table('sales_details')
            ->join('products', 'sales_details.productId', '=', 'products.id')
            ->select(
                'products.id',
                'products.productName',
                'products.productCode',
                DB::raw('SUM(sales_details.amount) as total_revenue')
            )
            ->groupBy('products.id', 'products.productName', 'products.productCode')
            ->orderByDesc('total_revenue')
            ->get();

        $totalRevenue = $products->sum('total_revenue');
        $cumulativeRevenue = 0;
        $classification = [];

        foreach ($products as $product) {
            $cumulativeRevenue += $product->total_revenue;
            $cumulativePercentage = ($cumulativeRevenue / $totalRevenue) * 100;

            if ($cumulativePercentage <= 80) {
                $class = 'A'; // Top 80% of revenue
            } elseif ($cumulativePercentage <= 95) {
                $class = 'B'; // Next 15% of revenue
            } else {
                $class = 'C'; // Bottom 5% of revenue
            }

            $classification[] = [
                'product_id' => $product->id,
                'product_name' => $product->productName,
                'product_code' => $product->productCode,
                'revenue' => round($product->total_revenue, 2),
                'class' => $class,
            ];
        }

        return $classification;
    }

    /**
     * Get dead stock report (Inventory with no sales in X days)
     */
    public function getDeadStockReport(int $days = 90): array
    {
        $cutoffDate = now()->subDays($days);

        // Subquery for products sold in the last X days
        $soldProductIds = DB::table('sales_details')
            ->join('sales', 'sales_details.salesId', '=', 'sales.id')
            ->where('sales.created_at', '>=', $cutoffDate)
            ->distinct()
            ->pluck('productId');

        // Products with positive stock that are NOT in the sold list
        $deadStock = Product::with('supplier')
            ->whereNotIn('id', $soldProductIds)
            ->where('quantity', '>', 0)
            ->where('status', 'active')
            ->get();

        return $deadStock->toArray();
    }

    /**
     * Get reorder report (Inventory at or below reorder point)
     */
    public function getReorderReport(): array
    {
        $reorderList = Product::with('supplier')
            ->whereColumn('quantity', '<=', 'reorder_point')
            ->where('status', 'active')
            ->orderBy('quantity', 'asc')
            ->get();

        return $reorderList->toArray();
    }

    /**
     * Get inventory turnover ratio
     * Ratio = COGS / Average Inventory Value
     */
    public function getInventoryTurnover(int $days = 365): array
    {
        $startDate = now()->subDays($days);
        
        // Calculate COGS
        $cogs = DB::table('sales_details')
            ->join('sales', 'sales_details.salesId', '=', 'sales.id')
            ->join('products', 'sales_details.productId', '=', 'products.id')
            ->where('sales.created_at', '>=', $startDate)
            ->where('sales.status', 'approved')
            ->selectRaw('SUM(sales_details.quantity * products.buyingPrice) as total')
            ->value('total') ?? 0;

        // Calculate Average Inventory (simplified: current value + value from start?)
        // For simplicity, we use current value as average if historical snapshots are unavailable
        $currentValue = DB::table('products')
            ->selectRaw('SUM(quantity * buyingPrice) as total')
            ->value('total') ?? 0;

        $turnoverRatio = $currentValue > 0 ? $cogs / $currentValue : 0;

        return [
            'period_days' => $days,
            'cogs' => round($cogs, 2),
            'average_inventory_value' => round($currentValue, 2),
            'inventory_turnover_ratio' => round($turnoverRatio, 2),
            'days_to_sell_inventory' => $turnoverRatio > 0 ? round($days / $turnoverRatio, 2) : 0,
        ];
    }

    /**
     * Get basic sales forecast using linear regression or simple averaging
     */
    public function getSalesForecast(int $months = 12): array
    {
        // Simple 3-month average growth projection
        $last3Months = Sales::where('created_at', '>=', now()->subMonths(3))
            ->where('status', 'approved')
            ->selectRaw('MONTH(created_at) as month, SUM(totalAmount) as total')
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('total')
            ->toArray();

        $count = count($last3Months);
        if ($count < 2) {
            return ['status' => 'insufficient_data'];
        }

        $averageSales = array_sum($last3Months) / $count;
        $growth = ($last3Months[$count-1] - $last3Months[0]) / ($count - 1);

        $forecast = [];
        for ($i = 1; $i <= $months; $i++) {
            $projected = $averageSales + ($growth * $i);
            $forecast[] = [
                'month' => now()->addMonths($i)->format('M Y'),
                'projected_sales' => round(max(0, $projected), 2)
            ];
        }

        return [
            'forecast_model' => 'linear_projection',
            'base_average_sales' => round($averageSales, 2),
            'monthly_growth_rate' => round($growth, 2),
            'projected_data' => $forecast
        ];
    }
}
