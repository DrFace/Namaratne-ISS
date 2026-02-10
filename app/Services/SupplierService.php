<?php

namespace App\Services;

use App\Models\Supplier;
use Illuminate\Support\Collection;

class SupplierService
{
    /**
     * Get all suppliers.
     */
    public function getAllSuppliers(): Collection
    {
        return Supplier::all();
    }

    /**
     * Create a new supplier.
     */
    public function createSupplier(array $data): Supplier
    {
        return Supplier::create($data);
    }

    /**
     * Update an existing supplier.
     */
    public function updateSupplier(int $id, array $data): Supplier
    {
        $supplier = Supplier::findOrFail($id);
        $supplier->update($data);
        return $supplier;
    }

    /**
     * Delete a supplier.
     */
    public function deleteSupplier(int $id): bool
    {
        $supplier = Supplier::findOrFail($id);
        return $supplier->delete();
    }
}
