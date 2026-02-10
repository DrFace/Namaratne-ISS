<?php

namespace App\Exports;

use App\Models\Product;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ProductsExport implements FromCollection, WithHeadings, WithMapping
{
    protected $ids;

    public function __construct(array $ids)
    {
        $this->ids = $ids;
    }

    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return Product::with(['serias', 'supplier'])->whereIn('id', $this->ids)->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Product Name',
            'Product Code',
            'Description',
            'Vehicle Type',
            'Brand',
            'Unit',
            'Buying Price',
            'Selling Price',
            'Quantity',
            'Status',
            'Created At',
        ];
    }

    public function map($product): array
    {
        return [
            $product->id,
            $product->productName,
            $product->productCode,
            $product->productDescription,
            $product->serias ? $product->serias->seriasNo : '',
            $product->brand,
            $product->unit,
            $product->buyingPrice,
            $product->sellingPrice,
            $product->quantity,
            $product->status,
            $product->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
