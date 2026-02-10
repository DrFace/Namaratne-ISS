import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import Card from '@/Components/UI/Card';
import Button from '@/Components/UI/Button';
import Badge from '@/Components/UI/Badge';
import Input from '@/Components/UI/Input';
import Modal from '@/Components/UI/Modal';
import DataTable from '@/Components/UI/DataTable';
import { 
  BuildingOfficeIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MapPinIcon, 
  PhoneIcon,
  EnvelopeIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

interface Supplier {
  id: number;
  supplierName: string;
  supplierAddress: string | null;
  supplierPhone: string | null;
  supplierEmail: string | null;
  companyName: string | null;
  availibility: 'active' | 'inactive';
  status: string | null;
}

interface Props {
  suppliers: Supplier[];
}

export default function Index({ suppliers }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const { data, setData, post, put, processing, errors, reset } = useForm({
    supplierName: '',
    supplierAddress: '',
    supplierPhone: '',
    supplierEmail: '',
    companyName: '',
    availibility: 'active' as 'active' | 'inactive',
    status: 'preferred',
  });

  const openAddModal = () => {
    setEditingSupplier(null);
    reset();
    setIsModalOpen(true);
  };

  const openEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setData({
      supplierName: supplier.supplierName,
      supplierAddress: supplier.supplierAddress || '',
      supplierPhone: supplier.supplierPhone || '',
      supplierEmail: supplier.supplierEmail || '',
      companyName: supplier.companyName || '',
      availibility: supplier.availibility || 'active',
      status: supplier.status || 'preferred',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSupplier(null);
    reset();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSupplier) {
      put(route('suppliers.update', editingSupplier.id), {
        onSuccess: () => {
          toast.success('Supplier updated successfully');
          closeModal();
        },
      });
    } else {
      post(route('suppliers.store'), {
        onSuccess: () => {
          toast.success('Supplier created successfully');
          closeModal();
        },
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this supplier?')) {
      router.delete(route('suppliers.destroy', id), {
        onSuccess: () => toast.success('Supplier deleted successfully'),
        onError: (err: any) => toast.error(err.message || 'Failed to delete supplier'),
      });
    }
  };

  const columns = [
    {
      header: 'Supplier Name',
      accessor: (item: Supplier) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600">
            <BuildingOfficeIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-gray-900 dark:text-white">{item.supplierName}</div>
            <div className="text-xs text-gray-400 mt-0.5 font-mono">{item.companyName || 'No Company'}</div>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Contact Info',
      accessor: (item: Supplier) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <PhoneIcon className="w-3.5 h-3.5" />
            {item.supplierPhone || 'N/A'}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <EnvelopeIcon className="w-3.5 h-3.5" />
            {item.supplierEmail || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      header: 'Location',
      accessor: (item: Supplier) => (
        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
          <MapPinIcon className="w-4 h-4" />
          <span className="truncate max-w-[150px]">{item.supplierAddress || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (item: Supplier) => (
        <div className="flex flex-col gap-1">
          <Badge variant={item.availibility === 'active' ? 'success' : 'neutral'}>
            {item.availibility}
          </Badge>
          {item.status && (
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">{item.status}</span>
          )}
        </div>
      ),
      sortable: true,
    },
  ];

  return (
    <AuthenticatedLayout>
      <Head title="Suppliers" />

      <div className="space-y-8 animate-premium-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Supplier Management
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Maintain your database of suppliers and vendors.
            </p>
          </div>
          <Button onClick={openAddModal} className="w-full md:w-auto">
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Supplier
          </Button>
        </div>

        <Card className="p-6">
          <DataTable
            data={suppliers}
            columns={columns}
            searchPlaceholder="Search suppliers..."
            actions={(item) => (
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => openEditModal(item)}>
                  <PencilIcon className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-rose-500 hover:bg-rose-50" onClick={() => handleDelete(item.id)}>
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
            )}
          />
        </Card>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Supplier Name"
              value={data.supplierName}
              onChange={(e) => setData('supplierName', e.target.value)}
              error={errors.supplierName}
              placeholder="John Doe"
              required
            />
            <Input
              label="Company Name"
              value={data.companyName}
              onChange={(e) => setData('companyName', e.target.value)}
              error={errors.companyName}
              placeholder="Supply Co. Ltd"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Phone Number"
              value={data.supplierPhone}
              onChange={(e) => setData('supplierPhone', e.target.value)}
              error={errors.supplierPhone}
              placeholder="+1 234 567 890"
            />
            <Input
              label="Email Address"
              type="email"
              value={data.supplierEmail}
              onChange={(e) => setData('supplierEmail', e.target.value)}
              error={errors.supplierEmail}
              placeholder="john@example.com"
            />
          </div>

          <Input
            label="Address"
            value={data.supplierAddress}
            onChange={(e) => setData('supplierAddress', e.target.value)}
            error={errors.supplierAddress}
            placeholder="123 Street, City, Country"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Availability</label>
              <select
                className="w-full rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                value={data.availibility}
                onChange={(e) => setData('availibility', e.target.value as 'active' | 'inactive')}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <Input
              label="Internal Status (e.g. Preferred)"
              value={data.status}
              onChange={(e) => setData('status', e.target.value)}
              error={errors.status}
              placeholder="Preferred, Secondary..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button variant="ghost" type="button" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" processing={processing}>
              {editingSupplier ? 'Update Supplier' : 'Create Supplier'}
            </Button>
          </div>
        </form>
      </Modal>
    </AuthenticatedLayout>
  );
}
