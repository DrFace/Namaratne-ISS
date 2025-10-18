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
            'customerId'    => 'nullable|integer|exists:customers,id',
            'cartItems'     => 'required|array|min:1',
            'cartItems.*.id' => 'required|integer|exists:products,id',
            'cartItems.*.quantity' => 'required|integer|min:1',
            'cartItems.*.sellingPrice' => 'required|numeric|min:0',
            'totalAmount'   => 'required|numeric|min:0',
            'paidAmount'    => 'nullable|numeric|min:0',
            'paymentMethod' => 'required|in:cash,card,credit',
            'status'        => 'required|in:draft,approved',
        ];
    }
}
