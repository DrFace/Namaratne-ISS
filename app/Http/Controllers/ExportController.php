<?php

namespace App\Http\Controllers;

use App\Exports\ProductsExport;
use App\Exports\SalesExport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\Request;

class ExportController extends Controller
{
    public function exportProducts()
    {
        return Excel::download(new ProductsExport, 'products.xlsx');
    }

    public function exportSales()
    {
        return Excel::download(new SalesExport, 'sales.xlsx');
    }

    public function exportProductsCsv()
    {
        return Excel::download(new ProductsExport, 'products.csv', \Maatwebsite\Excel\Excel::CSV);
    }

    public function exportSalesCsv()
    {
        return Excel::download(new SalesExport, 'sales.csv', \Maatwebsite\Excel\Excel::CSV);
    }
}
