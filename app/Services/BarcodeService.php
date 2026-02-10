<?php

namespace App\Services;

use Picqer\Barcode\BarcodeGeneratorPNG;
use Picqer\Barcode\BarcodeGeneratorSVG;
use Picqer\Barcode\BarcodeGeneratorHTML;
use App\Models\Product;

class BarcodeService
{
    /**
     * Generate barcode for a product
     */
    public function generateBarcode(string $code, string $type = 'CODE128', string $format = 'png'): string
    {
        $generator = match($format) {
            'svg' => new BarcodeGeneratorSVG(),
            'html' => new BarcodeGeneratorHTML(),
            default => new BarcodeGeneratorPNG(),
        };

        $barcodeType = constant("Picqer\Barcode\BarcodeGenerator::TYPE_$type");
        $barcode = $generator->getBarcode($code, $barcodeType);

        if ($format === 'png') {
            return 'data:image/png;base64,' . base64_encode($barcode);
        }

        return $barcode;
    }

    /**
     * Generate and save barcode image
     */
    public function generateAndSaveBarcode(Product $product, string $type = 'CODE128'): string
    {
        $generator = new BarcodeGeneratorPNG();
        $barcodeType = constant("Picqer\Barcode\BarcodeGenerator::TYPE_$type");
        
        $barcode = $generator->getBarcode($product->productCode, $barcodeType);
        
        // Save to public directory
        $filename = 'barcode_' . $product->productCode . '_' . time() . '.png';
        $path = public_path('barcodes');
        
        if (!file_exists($path)) {
            mkdir($path, 0755, true);
        }
        
        file_put_contents($path . '/' . $filename, $barcode);
        
        return 'barcodes/' . $filename;
    }

    /**
     * Generate barcode for multiple products
     */
    public function generateBulkBarcodes(array $productIds, string $type = 'CODE128'): array
    {
        $products = Product::whereIn('id', $productIds)->get();
        $barcodes = [];

        foreach ($products as $product) {
            $barcodes[$product->id] = [
                'product' => $product,
                'barcode' => $this->generateBarcode($product->productCode, $type),
            ];
        }

        return $barcodes;
    }

    /**
     * Get barcode as downloadable response
     */
    public function downloadBarcode(string $code, string $type = 'CODE128', string $filename = 'barcode.png')
    {
        $generator = new BarcodeGeneratorPNG();
        $barcodeType = constant("Picqer\Barcode\BarcodeGenerator::TYPE_$type");
        $barcode = $generator->getBarcode($code, $barcodeType);

        return response($barcode)
            ->header('Content-Type', 'image/png')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }

    /**
     * Get available barcode types
     */
    public function getAvailableTypes(): array
    {
        return [
            'CODE128' => 'CODE 128',
            'CODE128A' => 'CODE 128A',
            'CODE39' => 'CODE 39',
            'EAN13' => 'EAN-13',
            'EAN8' => 'EAN-8',
            'UPC' => 'UPC',
            'QRCODE' => 'QR Code',
        ];
    }
}
