import { usePage } from '@inertiajs/react';
import {
    Package,
    TrendingDown,
    AlertTriangle,
    DollarSign,
    ShoppingCart,
    TrendingUp,
    Calendar
} from 'lucide-react';
import Authenticated from '@/Layouts/AuthenticatedLayout';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

interface DashboardProps {
    kpis: {
        totalStockValue: number;
        totalProducts: number;
        lowStockCount: number;
        outOfStockCount: number;
        todaySalesValue: number;
        todaySalesCount: number;
        thisMonthSales: number;
        thisMonthProfit: number;
    };
    charts: {
        salesLast30Days: {
            labels: string[];
            data: number[];
        };
        stockByCategory: Array<{
            category: string;
            quantity: number;
        }>;
        topProducts: Array<{
            productName: string;
            totalSold: number;
        }>;
    };
    tables: {
        lowStockItems: Array<{
            id: number;
            productName: string;
            productCode: string;
            quantity: number;
            lowStock: number;
            batchNumber: string;
        }>;
        outOfStockItems: Array<{
            id: number;
            productName: string;
            productCode: string;
            batchNumber: string;
            updated_at: string;
        }>;
        recentTransactions: Array<{
            id: number;
            billNumber: string;
            customerName: string;
            amount: number;
            paymentMethod: string;
            status: string;
            date: string;
            createdBy: string;
        }>;
    };
}

export default function Dashboard() {
    const { auth, kpis, charts, tables, permissions, isAdmin } = usePage().props as any;
    const user = auth.user;

    // Helper function to check if user has permission
    const hasPermission = (permission: string) => {
        if (isAdmin) return true; // Admins have all permissions
        return permissions && permissions.includes(permission);
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR',
            minimumFractionDigits: 2,
        }).format(amount);
    };

    // Sales Trend Chart Data
    const salesChartData = {
        labels: charts?.salesLast30Days?.labels?.map((date: string) => {
            const d = new Date(date);
            return `${d.getMonth() + 1}/${d.getDate()}`;
        }) || [],
        datasets: [
            {
                label: 'Sales',
                data: charts?.salesLast30Days?.data || [],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true,
            },
        ],
    };

    // Stock by Category Chart Data
    const categoryChartData = {
        labels: charts?.stockByCategory?.map((item: any) => item.category) || [],
        datasets: [
            {
                data: charts?.stockByCategory?.map((item: any) => item.quantity) || [],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(251, 146, 60, 0.8)',
                    'rgba(168, 85, 247, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(14, 165, 233, 0.8)',
                ],
                borderWidth: 0,
            },
        ],
    };

    // Top Products Chart Data
    const topProductsChartData = {
        labels: charts?.topProducts?.map((item: any) => item.productName) || [],
        datasets: [
            {
                label: 'Units Sold',
                data: charts?.topProducts?.map((item: any) => item.totalSold) || [],
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
                borderRadius: 8,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'top' as const,
            },
        },
    };

    return (
        <Authenticated bRoutes={undefined}>
            <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 font-Inter">
                        Hi, {user.first_name}
                    </h1>
                    <p className="text-sm text-gray-600">
                        Here's your inventory overview and analytics
                    </p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {hasPermission('view_total_stock_value') && (
                        <KPICard
                            title="Total Stock Value"
                            value={formatCurrency(kpis?.totalStockValue || 0)}
                            icon={<DollarSign className="w-6 h-6" />}
                            color="blue"
                        />
                    )}
                    {hasPermission('view_total_products') && (
                        <KPICard
                            title="Total Products / SKUs"
                            value={kpis?.totalProducts || 0}
                            icon={<Package className="w-6 h-6" />}
                            color="green"
                        />
                    )}
                    {hasPermission('view_low_stock_count') && (
                        <KPICard
                            title="Low Stock Items"
                            value={kpis?.lowStockCount || 0}
                            icon={<TrendingDown className="w-6 h-6" />}
                            color="orange"
                        />
                    )}
                    {hasPermission('view_out_of_stock_count') && (
                        <KPICard
                            title="Out of Stock Items"
                            value={kpis?.outOfStockCount || 0}
                            icon={<AlertTriangle className="w-6 h-6" />}
                            color="red"
                        />
                    )}
                </div>

                {/* Sales KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {hasPermission('view_today_sales') && (
                        <KPICard
                            title="Today's Sales"
                            value={formatCurrency(kpis?.todaySalesValue || 0)}
                            subtitle={`${kpis?.todaySalesCount || 0} invoices`}
                            icon={<ShoppingCart className="w-6 h-6" />}
                            color="purple"
                        />
                    )}
                    {hasPermission('view_month_sales') && (
                        <KPICard
                            title="This Month's Sales"
                            value={formatCurrency(kpis?.thisMonthSales || 0)}
                            icon={<Calendar className="w-6 h-6" />}
                            color="indigo"
                        />
                    )}
                    {hasPermission('view_month_profit') && (
                        <KPICard
                            title="This Month's Profit"
                            value={formatCurrency(kpis?.thisMonthProfit || 0)}
                            subtitle="Estimated gross profit"
                            icon={<TrendingUp className="w-6 h-6" />}
                            color="emerald"
                        />
                    )}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Sales Trend */}
                    {hasPermission('view_sales_trend') && (
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                Sales Trend (Last 30 Days)
                            </h2>
                            <div className="h-64">
                                <Line data={salesChartData} options={chartOptions} />
                            </div>
                        </div>
                    )}

                    {/* Stock by Category */}
                    {hasPermission('view_stock_by_category') && (
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                Stock by Category
                            </h2>
                            <div className="h-64 flex items-center justify-center">
                                {charts?.stockByCategory?.length > 0 ? (
                                    <Doughnut data={categoryChartData} options={chartOptions} />
                                ) : (
                                    <p className="text-gray-500">No category data available</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Top Products Chart */}
                {hasPermission('view_top_selling_products') && (
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            Top 5 Selling Products (Last 30 Days)
                        </h2>
                        <div className="h-64">
                            {charts?.topProducts?.length > 0 ? (
                                <Bar
                                    data={topProductsChartData}
                                    options={{
                                        ...chartOptions,
                                        indexAxis: 'y' as const,
                                    }}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-gray-500">No sales data available</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tables Section */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Low Stock Table */}
                    {hasPermission('view_low_stock_alerts') && (
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <TrendingDown className="w-5 h-5 text-orange-500" />
                                Low Stock Alert
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-2 px-2 font-medium text-gray-600">Product</th>
                                            <th className="text-left py-2 px-2 font-medium text-gray-600">Code</th>
                                            <th className="text-center py-2 px-2 font-medium text-gray-600">Current</th>
                                            <th className="text-center py-2 px-2 font-medium text-gray-600">Threshold</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tables?.lowStockItems?.length > 0 ? (
                                            tables.lowStockItems.map((item: any) => (
                                                <tr key={item.id} className="border-b hover:bg-gray-50">
                                                    <td className="py-2 px-2">{item.productName}</td>
                                                    <td className="py-2 px-2 text-gray-600">{item.productCode}</td>
                                                    <td className="py-2 px-2 text-center">
                                                        <span className="text-orange-600 font-semibold">{item.quantity}</span>
                                                    </td>
                                                    <td className="py-2 px-2 text-center text-gray-600">{item.lowStock}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="text-center py-4 text-gray-500">
                                                    No low stock items
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Out of Stock Table */}
                    {hasPermission('view_out_of_stock_alerts') && (
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                Out of Stock
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-2 px-2 font-medium text-gray-600">Product</th>
                                            <th className="text-left py-2 px-2 font-medium text-gray-600">Code</th>
                                            <th className="text-left py-2 px-2 font-medium text-gray-600">Batch</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tables?.outOfStockItems?.length > 0 ? (
                                            tables.outOfStockItems.map((item: any) => (
                                                <tr key={item.id} className="border-b hover:bg-gray-50">
                                                    <td className="py-2 px-2">{item.productName}</td>
                                                    <td className="py-2 px-2 text-gray-600">{item.productCode}</td>
                                                    <td className="py-2 px-2 text-gray-600">{item.batchNumber || 'N/A'}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={3} className="text-center py-4 text-gray-500">
                                                    No out of stock items
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Recent Transactions */}
                {hasPermission('view_recent_transactions') && (
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            Recent Transactions
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2 px-2 font-medium text-gray-600">Bill #</th>
                                        <th className="text-left py-2 px-2 font-medium text-gray-600">Date</th>
                                        <th className="text-left py-2 px-2 font-medium text-gray-600">Customer</th>
                                        <th className="text-right py-2 px-2 font-medium text-gray-600">Amount</th>
                                        <th className="text-center py-2 px-2 font-medium text-gray-600">Payment</th>
                                        <th className="text-center py-2 px-2 font-medium text-gray-600">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tables?.recentTransactions?.length > 0 ? (
                                        tables.recentTransactions.map((transaction: any) => (
                                            <tr key={transaction.id} className="border-b hover:bg-gray-50">
                                                <td className="py-2 px-2 font-mono text-xs">{transaction.billNumber}</td>
                                                <td className="py-2 px-2 text-gray-600">{transaction.date}</td>
                                                <td className="py-2 px-2">{transaction.customerName}</td>
                                                <td className="py-2 px-2 text-right font-semibold">
                                                    {formatCurrency(transaction.amount)}
                                                </td>
                                                <td className="py-2 px-2 text-center">
                                                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100 capitalize">
                                                        {transaction.paymentMethod}
                                                    </span>
                                                </td>
                                                <td className="py-2 px-2 text-center">
                                                    <span className={`px-2 py-1 rounded-full text-xs capitalize ${transaction.status === 'approved'
                                                        ? 'bg-green-100 text-green-700'
                                                        : transaction.status === 'pending'
                                                            ? 'bg-yellow-100 text-yellow-700'
                                                            : 'bg-gray-100 text-gray-700'
                                                        }`}>
                                                        {transaction.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="text-center py-4 text-gray-500">
                                                No recent transactions
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </Authenticated>
    );
}

interface KPICardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'indigo' | 'emerald';
}

function KPICard({ title, value, subtitle, icon, color }: KPICardProps) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        orange: 'bg-orange-50 text-orange-600',
        red: 'bg-red-50 text-red-600',
        purple: 'bg-purple-50 text-purple-600',
        indigo: 'bg-indigo-50 text-indigo-600',
        emerald: 'bg-emerald-50 text-emerald-600',
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition">
            <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
                {icon}
            </div>
            <div className="flex-1">
                <div className="text-sm text-gray-600 font-medium">{title}</div>
                <div className="text-2xl font-bold text-gray-800">{value}</div>
                {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
            </div>
        </div>
    );
}
