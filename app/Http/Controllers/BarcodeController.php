<?php

namespace App\Http\Controllers;

use App\Services\BarcodeService;
use App\Models\Product;
use Illuminate\Http\Request;

class BarcodeController extends Controller
{
    public function __construct(
        protected BarcodeService $barcodeService
    ) {}

    /**
     * Generate barcode for a product
     */
    public function generate(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string',
            'type' => 'sometimes|string|in:CODE128,CODE128A,CODE39,EAN13,EAN8,UPC,QRCODE',
            'format' => 'sometimes|string|in:png,svg,html',
        ]);

        $barcode = $this->barcodeService->generateBarcode(
            $validated['code'],
            $validated['type'] ?? 'CODE128',
            $validated['format'] ?? 'png'
        );

        return response()->json([
            'barcode' => $barcode,
            'code' => $validated['code'],
        ]);
    }

    /**
     * Generate and save barcode for product
     */
    public function save(Request $request, $productId)
    {
        $product = Product::findOrFail($productId);
        
        $validated = $request->validate([
            'type' => 'sometimes|string|in:CODE128,CODE128A,CODE39,EAN13,EAN8,UPC',
        ]);

        try {
            $path = $this->barcodeService->generateAndSaveBarcode(
                $product,
                $validated['type'] ?? 'CODE128'
            );

            // Update product with barcode path
            $product->update(['barcode' => $path]);

            return response()->json([
                'message' => 'Barcode generated and saved successfully',
                'barcode_path' => $path,
                'product' => $product,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error generating barcode: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Download barcode
     */
    public function download(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string',
            'type' => 'sometimes|string|in:CODE128,CODE128A,CODE39,EAN13,EAN8,UPC',
        ]);

        return $this->barcodeService->downloadBarcode(
            $validated['code'],
            $validated['type'] ?? 'CODE128',
            'barcode_' . $validated['code'] . '.png'
        );
    }

    /**
     * Generate barcodes for multiple products
     */
    public function bulk(Request $request)
    {
        $validated = $request->validate([
            'product_ids' => 'required|array',
            'product_ids.*' => 'integer|exists:products,id',
            'type' => 'sometimes|string|in:CODE128,CODE128A,CODE39,EAN13,EAN8,UPC',
        ]);

        $barcodes = $this->barcodeService->generateBulkBarcodes(
            $validated['product_ids'],
            $validated['type'] ?? 'CODE128'
        );

        return response()->json([
            'barcodes' => $barcodes,
            'count' => count($barcodes),
        ]);
    }

    /**
     * Get available barcode types
     */
    public function types()
    {
        return response()->json([
            'types' => $this->barcodeService->getAvailableTypes(),
        ]);
    }
}
