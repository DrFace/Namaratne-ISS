<?php

namespace App\Http\Controllers;

use App\Imports\ProductImport;
use App\Imports\CustomerImport;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Storage;

class BulkImportController extends Controller
{
    public function importProducts(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv'
        ]);

        Excel::import(new ProductImport, $request->file('file'));

        return back()->with('success', 'Products imported successfully!');
    }

    public function importCustomers(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv'
        ]);

        Excel::import(new CustomerImport, $request->file('file'));

        return back()->with('success', 'Customers imported successfully!');
    }

    public function downloadTemplate($type)
    {
        $headers = [];
        $filename = "";

        if ($type === 'products') {
            $headers = ['product_name', 'product_code', 'description', 'buying_price', 'selling_price', 'quantity', 'unit', 'brand', 'vehicle_type'];
            $filename = "products_template.csv";
        } elseif ($type === 'customers') {
            $headers = ['name', 'email', 'contact_number', 'address', 'credit_limit'];
            $filename = "customers_template.csv";
        } else {
            return abort(404);
        }

        $callback = function() use ($headers) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $headers);
            fclose($file);
        };

        return response()->streamDownload($callback, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }
}
