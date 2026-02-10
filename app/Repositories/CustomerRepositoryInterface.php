<?php

namespace App\Repositories;

interface CustomerRepositoryInterface
{
    public function find(int $id);
    public function findByCustomerId(string $customerId);
    public function create(array $data);
    public function update(int $id, array $data);
    public function delete(int $id);
    public function getPaginated(array $filters, int $perPage);
    public function getActiveCustomers();
}
