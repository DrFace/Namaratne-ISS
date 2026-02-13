<?php

namespace App\Services;

use App\Models\Product;
use App\Models\SeriasNumber;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\ProductsExport;

class ProductService
{
    /**
     * Get paginated products with filters
     */
    public function getPaginatedProducts(array $filters = [], int $perPage = 50)
    {
        $query = $this->buildProductQuery($filters);
        return $query->latest()->paginate($perPage);
    }

    /**
     * Build product query from filters
     */
    protected function buildProductQuery(array $filters)
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

        if (!empty($filters['seriasId'])) {
            $query->where('seriasId', $filters['seriasId']);
        }

        if (isset($filters['min_price'])) {
            $query->where('sellingPrice', '>=', $filters['min_price']);
        }

        if (isset($filters['max_price'])) {
            $query->where('sellingPrice', '<=', $filters['max_price']);
        }

        if (isset($filters['in_stock'])) {
            if ($filters['in_stock'] === '1') {
                $query->where('quantity', '>', 0);
            } elseif ($filters['in_stock'] === '0') {
                $query->where('quantity', '<=', 0);
            }
        }

        return $query;
    }

    /**
     * Create a new product
     */
    public function createProduct(array $data): Product
    {
        DB::beginTransaction();
        try {
            // Handle image upload if present
            if (isset($data['productImage']) && !is_string($data['productImage'])) {
                $data['productImage'] = $this->handleImageUpload($data['productImage']);
            }

            // Calculate profit margin
            if (isset($data['buyingPrice']) && isset($data['sellingPrice'])) {
                $data['profitMargin'] = $this->calculateProfitMargin(
                    $data['buyingPrice'],
                    $data['sellingPrice']
                );
            }

            $product = Product::create($data);

            $this->clearProductCache($product->id);

            DB::commit();
            return $product;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update an existing product
     */
    public function updateProduct(int $id, array $data): Product
    {
        DB::beginTransaction();
        try {
            $product = Product::findOrFail($id);

            // Handle image upload if present
            if (isset($data['productImage']) && !is_string($data['productImage'])) {
                // Delete old image if exists
                if ($product->productImage) {
                    Storage::delete('public/' . $product->productImage);
                }
                $data['productImage'] = $this->handleImageUpload($data['productImage']);
            }

            // Recalculate profit margin if prices changed
            if (isset($data['buyingPrice']) || isset($data['sellingPrice'])) {
                $buyingPrice = $data['buyingPrice'] ?? $product->buyingPrice;
                $sellingPrice = $data['sellingPrice'] ?? $product->sellingPrice;
                $data['profitMargin'] = $this->calculateProfitMargin($buyingPrice, $sellingPrice);
            }

            $product->update($data);

            $this->clearProductCache($product->id);

            DB::commit();
            return $product->fresh();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update stock quantity
     */
    public function updateStock(int $id, int $change): bool
    {
        $product = Product::findOrFail($id);
        $product->increment('quantity', $change);
        $this->clearProductCache($id);
        return true;
    }

    /**
     * Delete a product
     */
    public function deleteProduct(int $id): bool
    {
        DB::beginTransaction();
        try {
            $product = Product::findOrFail($id);

            // Delete associated image
            if ($product->productImage) {
                Storage::delete('public/' . $product->productImage);
            }

            $product->delete();

            $this->clearProductCache($id);

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Bulk delete products
     */
    public function bulkDelete(array $ids): bool
    {
        DB::beginTransaction();
        try {
            $products = Product::whereIn('id', $ids)->get();

            foreach ($products as $product) {
                if ($product->productImage) {
                    Storage::delete('public/' . $product->productImage);
                }
                $product->delete();
                $this->clearProductCache($product->id);
            }

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Bulk update products
     */
    public function bulkUpdate(array $ids, array $data): bool
    {
        DB::beginTransaction();
        try {
            // Filter out protected fields
            $updateData = array_intersect_key($data, array_flip([
                'brand', 'unit', 'lowStock', 'status', 'availability', 'seriasId', 'vehicle_type'
            ]));

            if (empty($updateData)) {
                return false;
            }

            $products = Product::whereIn('id', $ids)->get();

            foreach ($products as $product) {
                $product->update($updateData);
                $this->clearProductCache($product->id);
            }

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Get product by ID
     */
    public function getProductById(int $id): ?Product
    {
        return Cache::remember("product_{$id}", now()->addHours(1), function () use ($id) {
            return Product::with(['supplier', 'serias'])->find($id);
        });
    }

    /**
     * Clear product cache
     */
    protected function clearProductCache(int $id): void
    {
        Cache::forget("product_{$id}");
        // Also clear lists that might contain this product if needed
    }

    /**
     * Get product by code
     */
    public function getProductByCode(string $code): ?Product
    {
        return Product::where('productCode', $code)->first();
    }

    /**
     * Get low stock products
     */
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

    /**
     * Get expiring products
     */
    public function getExpiringProducts(int $days = 30)
    {
        $expiryDate = now()->addDays($days);

        return Product::where('status', 'active')
            ->whereNotNull('expiryDate')
            ->where('expiryDate', '<=', $expiryDate)
            ->where('expiryDate', '>=', now())
            ->get();
    }

    /**
     * Get products by batch number
     */
    public function getProductsByBatch(string $productId)
    {
        return Product::where('productCode', $productId)
            ->whereNotNull('batchNumber')
            ->orderBy('expiryDate', 'asc')
            ->get();
    }

    /**
     * Handle image upload
     */
    protected function handleImageUpload($image): string
    {
        $filename = time() . '_' . $image->getClientOriginalName();
        $path = $image->storeAs('products', $filename, 'public');
        return $path;
    }

    /**
     * Calculate profit margin percentage
     */
    protected function calculateProfitMargin(float $buyingPrice, float $sellingPrice): float
    {
        if ($buyingPrice == 0) {
            return 0;
        }

        return (($sellingPrice - $buyingPrice) / $buyingPrice) * 100;
    }

    /**
     * Export products
     */
    public function exportProducts(array $ids, string $format = 'xlsx')
    {
        $export = new ProductsExport($ids);
        
        $fileName = 'products_export_' . date('Y-m-d_H-i-s') . '.' . $format;
        
        if ($format === 'csv') {
            return Excel::download($export, $fileName, \Maatwebsite\Excel\Excel::CSV);
        }
        
        return Excel::download($export, $fileName, \Maatwebsite\Excel\Excel::XLSX);
    }

    /**
     * Export products by filter
     */
    public function exportFilteredProducts(array $filters, string $format = 'xlsx')
    {
        $query = $this->buildProductQuery($filters);
        $ids = $query->pluck('id')->toArray();
        return $this->exportProducts($ids, $format);
    }
}
