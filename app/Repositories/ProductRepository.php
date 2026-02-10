<?php

namespace App\Repositories;

use App\Models\Product;

class ProductRepository implements ProductRepositoryInterface
{
    public function find(int $id)
    {
        return Product::with(['supplier', 'serias'])->find($id);
    }

    public function findByCode(string $code)
    {
        return Product::where('productCode', $code)->first();
    }

    public function create(array $data)
    {
        return Product::create($data);
    }

    public function update(int $id, array $data)
    {
        $product = Product::findOrFail($id);
        $product->update($data);
        return $product->fresh();
    }

    public function delete(int $id)
    {
        $product = Product::findOrFail($id);
        return $product->delete();
    }

    public function getLowStockProducts(int $threshold = null)
    {
        $query = Product::where('status', 'active');

        if ($threshold) {
            $query->whereRaw('quantity <= ?', [$threshold]);
        } else {
            $query->whereRaw('quantity <= lowStock');
        }

        return $query->get();
    }

    public function getExpiringProducts(int $days)
    {
        $expiryDate = now()->addDays($days);

        return Product::where('status', 'active')
            ->whereNotNull('expiryDate')
            ->where('expiryDate', '<=', $expiryDate)
            ->where('expiryDate', '>=', now())
            ->get();
    }

    public function getPaginated(array $filters, int $perPage)
    {
        $query = Product::with(['supplier', 'serias']);

        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('productName', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('productCode', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('productDescription', 'like', '%' . $filters['search'] . '%');
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['availability'])) {
            $query->where('availability', $filters['availability']);
        }

        return $query->latest()->paginate($perPage);
    }

    public function getByBatch(string $productId)
    {
        return Product::where('productCode', $productId)
            ->whereNotNull('batchNumber')
            ->orderBy('expiryDate', 'asc')
            ->get();
    }
}
