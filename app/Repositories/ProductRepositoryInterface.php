<?php

namespace App\Repositories;

interface ProductRepositoryInterface
{
    public function find(int $id);
    public function findByCode(string $code);
    public function create(array $data);
    public function update(int $id, array $data);
    public function delete(int $id);
    public function getLowStockProducts(int $threshold = null);
    public function getExpiringProducts(int $days);
    public function getPaginated(array $filters, int $perPage);
    public function getByBatch(string $productId);
}
