<?php

namespace App\Repositories;

interface SalesRepositoryInterface
{
    public function find(int $id);
    public function findByBillNumber(string $billNumber);
    public function create(array $data);
    public function getPaginated(array $filters, int $perPage);
    public function getDailySummary($date = null);
    public function getByDateRange($startDate, $endDate);
}
