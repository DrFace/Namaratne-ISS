<?php
namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class CustomerRequest extends FormRequest
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
            'name'          => 'required|string|max:255',
            'contactNumber' => 'required|string|max:20',
            'email'         => 'nullable|email|max:255',
            'address'       => 'nullable|string|max:500',
            'vatNumber'     => 'nullable|string|max:50',
            'creditLimit'   => 'nullable|numeric|min:0',
            'creditPeriod'  => 'required|in:15 days,30 days,50 days,60 days',
            'discountValue' => 'nullable|numeric|min:0',
            'discountType'  => 'nullable|in:amount,percentage',
            'netBalance'    => 'nullable|numeric|min:0',
            'status'        => 'required|in:active,inactive',
            'availability'  => 'boolean',
        ];
    }
}
