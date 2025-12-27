<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Product;
use App\Models\Sales;
use App\Models\SalesDetails;
use App\Models\SeriasNumber;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        // Get customers with expired credit periods who cannot purchase
        $expiredCreditCustomers = Customer::where('canPurchase', false)
            ->whereNotNull('creditPeriodExpiresAt')
            ->where('creditPeriodExpiresAt', '<', now())
            ->select('id', 'name', 'creditPeriodExpiresAt', 'currentCreditSpend', 'creditLimit')
            ->get()
            ->map(function ($customer) {
                $customer->daysOverdue = now()->diffInDays($customer->creditPeriodExpiresAt);
                return $customer;
            });

        $dashboardData = [
            'kpis' => $this->getKPIs(),
            'charts' => $this->getChartData(),
            'tables' => $this->getTableData(),
            'permissions' => $user->getPermissions(),
            'userRole' => $user->getRoleName(),
            'isAdmin' => $user->isAdmin(),
            'expiredCreditCustomers' => $expiredCreditCustomers,
        ];

        return Inertia::render('Dashboard', $dashboardData);
    }

    private function getKPIs()
    {
        // Total Stock Value (sum of quantity * buyingPrice for all products)
        $totalStockValue = Product::whereNotNull('buyingPrice')
            ->where('quantity', '>', 0)
            ->get()
            ->sum(function ($product) {
                return $product->quantity * $product->buyingPrice;
            });

        // Total Products/SKUs (distinct product codes)
        $totalProducts = Product::distinct('productCode')->count('productCode');

        // Low Stock Items (quantity <= lowStock threshold AND quantity > 0)
        $lowStockCount = Product::whereColumn('quantity', '<=', 'lowStock')
            ->where('quantity', '>', 0)
            ->whereNotNull('lowStock')
            ->count();

        // Out of Stock Items (quantity = 0 or null)
        $outOfStockCount = Product::where(function ($query) {
            $query->where('quantity', 0)
                ->orWhereNull('quantity');
        })->count();

        // Today's Sales
        $todaySales = Sales::whereDate('created_at', Carbon::today())
            ->where('status', 'approved')
            ->selectRaw('COUNT(*) as count, COALESCE(SUM(totalAmount), 0) as total')
            ->first();

        // This Month's Sales (as a proxy for profit since we don't have purchase tracking)
        $thisMonthSales = Sales::whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->where('status', 'approved')
            ->sum('totalAmount');

        // Calculate estimated profit (sum of profit margins from sold items)
        $thisMonthProfit = SalesDetails::join('sales', 'sales_details.salesId', '=', 'sales.id')
            ->join('products', 'sales_details.productId', '=', 'products.id')
            ->whereMonth('sales.created_at', Carbon::now()->month)
            ->whereYear('sales.created_at', Carbon::now()->year)
            ->where('sales.status', 'approved')
            ->whereNotNull('products.buyingPrice')
            ->select(
                'sales_details.quantity',
                'sales_details.salePrice',
                'products.buyingPrice'
            )
            ->get()
            ->sum(function ($detail) {
                $profit = ($detail->salePrice - $detail->buyingPrice) * $detail->quantity;
                return $profit;
            });

        return [
            'totalStockValue' => round($totalStockValue, 2),
            'totalProducts' => $totalProducts,
            'lowStockCount' => $lowStockCount,
            'outOfStockCount' => $outOfStockCount,
            'todaySalesValue' => round($todaySales->total ?? 0, 2),
            'todaySalesCount' => $todaySales->count ?? 0,
            'thisMonthSales' => round($thisMonthSales ?? 0, 2),
            'thisMonthProfit' => round($thisMonthProfit, 2),
        ];
    }

    private function getChartData()
    {
        // Sales Last 30 Days (daily aggregation)
        $salesLast30Days = Sales::where('created_at', '>=', Carbon::now()->subDays(30))
            ->where('status', 'approved')
            ->selectRaw('DATE(created_at) as date, SUM(totalAmount) as total')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->pluck('total', 'date')
            ->toArray();

        // Fill in missing dates with 0
        $last30Days = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i)->format('Y-m-d');
            $last30Days[$date] = $salesLast30Days[$date] ?? 0;
        }

        // Stock by Category (using serias as categories)
        $stockByCategory = Product::join('serias_numbers', 'products.seriasId', '=', 'serias_numbers.id')
            ->select('serias_numbers.seriasNo as category', DB::raw('SUM(products.quantity) as quantity'))
            ->where('products.quantity', '>', 0)
            ->groupBy('serias_numbers.id', 'serias_numbers.seriasNo')
            ->get()
            ->toArray();

        // Top 5 Selling Products (last 30 days)
        $topProducts = SalesDetails::join('sales', 'sales_details.salesId', '=', 'sales.id')
            ->join('products', 'sales_details.productId', '=', 'products.id')
            ->where('sales.created_at', '>=', Carbon::now()->subDays(30))
            ->where('sales.status', 'approved')
            ->select('products.productName', DB::raw('SUM(sales_details.quantity) as totalSold'))
            ->groupBy('products.id', 'products.productName')
            ->orderByDesc('totalSold')
            ->limit(5)
            ->get()
            ->toArray();

        return [
            'salesLast30Days' => [
                'labels' => array_keys($last30Days),
                'data' => array_values($last30Days),
            ],
            'stockByCategory' => $stockByCategory,
            'topProducts' => $topProducts,
        ];
    }

    private function getTableData()
    {
        // Low Stock Items
        $lowStockItems = Product::whereColumn('quantity', '<=', 'lowStock')
            ->where('quantity', '>', 0)
            ->whereNotNull('lowStock')
            ->select('id', 'productName', 'productCode', 'quantity', 'lowStock', 'batchNumber')
            ->orderBy('quantity')
            ->limit(10)
            ->get()
            ->toArray();

        // Out of Stock Items
        $outOfStockItems = Product::where(function ($query) {
            $query->where('quantity', 0)
                ->orWhereNull('quantity');
        })
            ->select('id', 'productName', 'productCode', 'batchNumber', 'updated_at')
            ->orderBy('updated_at', 'desc')
            ->limit(10)
            ->get()
            ->toArray();

        // Recent Transactions (Sales only - last 10)
        $recentTransactions = Sales::with(['customer:id,name', 'createdByUser:id,first_name,last_name'])
            ->select('id', 'billNumber', 'customerId', 'totalAmount', 'paymentMethod', 'status', 'created_at', 'createdBy')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($sale) {
                return [
                    'id' => $sale->id,
                    'billNumber' => $sale->billNumber,
                    'customerName' => $sale->customer ? $sale->customer->name : 'Walk-in Customer',
                    'amount' => $sale->totalAmount,
                    'paymentMethod' => $sale->paymentMethod,
                    'status' => $sale->status,
                    'date' => $sale->created_at->format('Y-m-d H:i'),
                    'createdBy' => $sale->createdByUser ? $sale->createdByUser->first_name . ' ' . $sale->createdByUser->last_name : 'N/A',
                ];
            })
            ->toArray();

        return [
            'lowStockItems' => $lowStockItems,
            'outOfStockItems' => $outOfStockItems,
            'recentTransactions' => $recentTransactions,
        ];
    }
}
