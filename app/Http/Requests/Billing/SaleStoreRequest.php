<?php
namespace App\Http\Requests\Billing;

use Illuminate\Foundation\Http\FormRequest;

class SaleStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'customerId'               => 'nullable|integer|exists:customers,id',
            'cartItems'                => 'required|array|min:1',
            'cartItems.*.id'           => 'required|integer|exists:products,id',
            'cartItems.*.quantity'     => 'required|integer|min:1',
            'cartItems.*.sellingPrice' => 'required|numeric|min:0',
            'totalAmount'              => 'required|numeric|min:0',
            'discountValue'            => 'nullable|numeric|min:0',
            'cashAmount'               => 'nullable|numeric|min:0',
            'cardAmount'               => 'nullable|numeric|min:0',
            'creditAmount'             => 'nullable|numeric|min:0',
            'paidAmount'               => 'nullable|numeric|min:0',
            'paymentMethod'            => 'required|in:cash,card,credit',
            'status'                   => 'required|in:draft,approved',
        ];
    }

    public function messages(): array
    {
        return [
            'cartItems.required'           => 'Cart cannot be empty.',
            'cartItems.*.quantity.min'     => 'Quantity must be at least 1.',
            'cartItems.*.sellingPrice.min' => 'Selling price cannot be negative.',
            'totalAmount.required'         => 'Total amount is required.',
            'paymentMethod.required'       => 'Please select a payment method.',
            'status.required'              => 'Sale status is required.',
        ];
    }
}
