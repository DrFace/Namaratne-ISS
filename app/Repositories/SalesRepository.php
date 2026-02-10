<?php

namespace App\Repositories;

use App\Models\Sales;

class SalesRepository
{
    public function all()
    {
        return Sales::with(['customer', 'items'])->get();
    }

    public function find(int $id)
    {
        return Sales::with(['customer', 'items.product'])->findOrFail($id);
    }

    public function create(array $data)
    {
        return Sales::create($data);
    }

    public function update(int $id, array $data)
    {
        $sale = $this->find($id);
        $sale->update($data);
        return $sale;
    }

    public function delete(int $id)
    {
        return $this->find($id)->delete();
    }
}
