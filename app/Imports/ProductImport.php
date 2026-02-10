<?php

namespace App\Imports;

use App\Models\Product;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ProductImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        return new Product([
            'productName'        => $row['product_name'] ?? $row['name'],
            'productCode'        => $row['product_code'] ?? $row['code'],
            'productDescription' => $row['description'] ?? null,
            'buyingPrice'        => $row['buying_price'] ?? 0,
            'sellingPrice'       => $row['selling_price'] ?? 0,
            'quantity'           => $row['quantity'] ?? 0,
            'unit'               => $row['unit'] ?? 'PCS',
            'brand'              => $row['brand'] ?? null,
            'vehicle_type'       => $row['vehicle_type'] ?? null,
            'status'             => 'approved',
            'availability'       => 'instock',
        ]);
    }
}
