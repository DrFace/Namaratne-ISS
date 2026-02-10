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
  HomeModernIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MapPinIcon, 
  PhoneIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

interface Warehouse {
  id: number;
  name: string;
  location: string | null;
  contact_number: string | null;
  status: 'active' | 'inactive';
  is_primary: boolean;
}

interface Props {
  warehouses: Warehouse[];
  isAdmin: boolean;
  permissions: string[];
}

export default function Index({ warehouses, isAdmin, permissions }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);

  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: '',
    location: '',
    contact_number: '',
    status: 'active' as 'active' | 'inactive',
    is_primary: false,
  });

  const openAddModal = () => {
    setEditingWarehouse(null);
    reset();
    setIsModalOpen(true);
  };

  const openEditModal = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setData({
      name: warehouse.name,
      location: warehouse.location || '',
      contact_number: warehouse.contact_number || '',
      status: warehouse.status,
      is_primary: !!warehouse.is_primary,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingWarehouse(null);
    reset();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWarehouse) {
      put(route('warehouses.update', editingWarehouse.id), {
        onSuccess: () => {
          toast.success('Warehouse updated successfully');
          closeModal();
        },
      });
    } else {
      post(route('warehouses.store'), {
        onSuccess: () => {
          toast.success('Warehouse created successfully');
          closeModal();
        },
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this warehouse?')) {
      router.delete(route('warehouses.destroy', id), {
        onSuccess: () => toast.success('Warehouse deleted successfully'),
        onError: (err: any) => toast.error(err.message || 'Failed to delete warehouse'),
      });
    }
  };

  const columns = [
    {
      header: 'Warehouse Name',
      accessor: (item: Warehouse) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600">
            <HomeModernIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {item.name}
              {item.is_primary && (
                <Badge variant="success" className="text-[10px] py-0 px-1.5 uppercase font-black tracking-tighter">Primary</Badge>
              )}
            </div>
            <div className="text-xs text-gray-400 mt-0.5 font-mono">ID: WH-{String(item.id).padStart(3, '0')}</div>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Location',
      accessor: (item: Warehouse) => (
        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
          <MapPinIcon className="w-4 h-4" />
          {item.location || 'N/A'}
        </div>
      ),
    },
    {
      header: 'Contact',
      accessor: (item: Warehouse) => (
        <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
          <PhoneIcon className="w-4 h-4" />
          {item.contact_number || 'N/A'}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (item: Warehouse) => (
        <Badge variant={item.status === 'active' ? 'success' : 'neutral'}>
          {item.status}
        </Badge>
      ),
      sortable: true,
    },
  ];

  return (
    <AuthenticatedLayout>
      <Head title="Warehouses" />

      <div className="space-y-8 animate-premium-in">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Warehouse Management
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage your inventory locations and stock distribution.
            </p>
          </div>
          <Button onClick={openAddModal} className="w-full md:w-auto">
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Warehouse
          </Button>
        </div>

        {/* Stats Grid Placeholder (Future: total stock value per warehouse) */}
        

        {/* Inventory List */}
        <Card className="p-6">
          <DataTable
            data={warehouses}
            columns={columns}
            searchPlaceholder="Search warehouses..."
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
            onRowClick={(item) => router.get(route('warehouses.show', item.id))}
          />
        </Card>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingWarehouse ? 'Edit Warehouse' : 'Add New Warehouse'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Warehouse Name"
            value={data.name}
            onChange={(e) => setData('name', e.target.value)}
            error={errors.name}
            placeholder="Main Warehouse, Distribution Center..."
            required
          />
          <Input
            label="Location / Address"
            value={data.location}
            onChange={(e) => setData('location', e.target.value)}
            error={errors.location}
            placeholder="123 Storage St, Logistics Park..."
          />
          <Input
            label="Contact Number"
            value={data.contact_number}
            onChange={(e) => setData('contact_number', e.target.value)}
            error={errors.contact_number}
            placeholder="+1 (555) 000-0000"
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Status</label>
              <select
                className="w-full rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                value={data.status}
                onChange={(e) => setData('status', e.target.value as 'active' | 'inactive')}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex items-center pt-8">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={data.is_primary}
                    onChange={(e) => setData('is_primary', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                </div>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 transition-colors">Is Primary?</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button variant="ghost" type="button" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" processing={processing}>
              {editingWarehouse ? 'Update Warehouse' : 'Create Warehouse'}
            </Button>
          </div>
        </form>
      </Modal>
    </AuthenticatedLayout>
  );
}
