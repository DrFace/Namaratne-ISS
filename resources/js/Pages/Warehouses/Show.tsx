import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import Card from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import Badge from '@/Components/UI/Badge';
import DataTable from '@/Components/UI/DataTable';
import { 
  HomeModernIcon, 
  ArrowLeftIcon,
  ArchiveBoxIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline';

interface Product {
  id: number;
  productName: string;
  productCode: string;
}

interface InventoryItem {
  id: number;
  product_id: number;
  quantity: number;
  product: Product;
}

interface Warehouse {
  id: number;
  name: string;
  location: string | null;
  inventory: InventoryItem[];
}

interface Props {
  warehouse: Warehouse;
}

export default function Show({ warehouse }: Props) {
  const columns = [
    {
      header: 'Product',
      accessor: (item: InventoryItem) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600">
            <ArchiveBoxIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-gray-900 dark:text-white uppercase tracking-tight">
              {item.product.productName}
            </div>
            <div className="text-xs text-gray-400 font-mono mt-0.5">{item.product.productCode}</div>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Quantity',
      accessor: (item: InventoryItem) => (
        <div className="flex items-center gap-2">
          <span className="text-lg font-black text-gray-900 dark:text-gray-100 tabular-nums">
            {item.quantity}
          </span>
          <span className="text-xs text-gray-400 uppercase font-bold">Units</span>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Stock Status',
      accessor: (item: InventoryItem) => (
        <Badge variant={item.quantity > 50 ? 'success' : item.quantity > 10 ? 'warning' : 'error'}>
          {item.quantity > 50 ? 'High' : item.quantity > 10 ? 'Medium' : 'Low'}
        </Badge>
      ),
    },
  ];

  const totalItems = warehouse.inventory.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <AuthenticatedLayout>
      <Head title={`Warehouse - ${warehouse.name}`} />

      <div className="space-y-8 animate-premium-in">
        {/* Header Section */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.get(route('warehouses.index'))}>
            <ArrowLeftIcon className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
              <HomeModernIcon className="w-8 h-8 text-indigo-600" />
              {warehouse.name}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {warehouse.location || 'No location specified'}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600">
              <ArchiveBoxIcon className="w-8 h-8" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Unique SKUs</div>
              <div className="text-3xl font-black text-gray-900 dark:text-white">{warehouse.inventory.length}</div>
            </div>
          </Card>
          <Card className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600">
              <CircleStackIcon className="w-8 h-8" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Stock</div>
              <div className="text-3xl font-black text-gray-900 dark:text-white">{totalItems}</div>
            </div>
          </Card>
        </div>

        {/* Inventory List */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Warehouse Inventory</h2>
          </div>
          <DataTable
            data={warehouse.inventory}
            columns={columns}
            searchPlaceholder="Search products in this warehouse..."
          />
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}
