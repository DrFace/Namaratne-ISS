<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\CustomerService;
use App\Http\Resources\V1\CustomerResource;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function __construct(
        protected CustomerService $customerService
    ) {}

    /**
     * Get all customers with pagination
     */
    public function index(Request $request)
    {
        $filters = $request->only(['search', 'status']);
        $perPage = $request->input('per_page', 50);

        $customers = $this->customerService->getPaginatedCustomers($filters, $perPage);

        return CustomerResource::collection($customers);
    }

    /**
     * Create a new customer
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'                => 'required|string|max:255',
            'contactNumber'       => 'required|string|max:20',
            'email'               => 'nullable|email|unique:customers',
            'address'             => 'nullable|string',
            'vatNumber'           => 'nullable|string',
            'creditLimit'         => 'nullable|numeric',
            'creditPeriod'        => 'nullable|string',
            'discount_category_id' => 'nullable|integer',
        ]);

        try {
            $customer = $this->customerService->createCustomer($validated);

            return response()->json([
                'message' => 'Customer created successfully',
                'data' => new CustomerResource($customer)
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error creating customer',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single customer
     */
    public function show($id)
    {
        $customer = $this->customerService->getCustomerById($id);

        if (!$customer) {
            return response()->json([
                'message' => 'Customer not found'
            ], 404);
        }

        return new CustomerResource($customer);
    }

    /**
     * Update customer
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name'                => 'sometimes|string|max:255',
            'contactNumber'       => 'sometimes|string|max:20',
            'email'               => 'nullable|email',
            'address'             => 'nullable|string',
            'vatNumber'           => 'nullable|string',
            'creditLimit'         => 'nullable|numeric',
            'creditPeriod'        => 'nullable|string',
            'discount_category_id' => 'nullable|integer',
        ]);

        try {
            $customer = $this->customerService->updateCustomer($id, $validated);

            return response()->json([
                'message' => 'Customer updated successfully',
                'data' => new CustomerResource($customer)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error updating customer',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete customer
     */
    public function destroy($id)
    {
        try {
            $this->customerService->deleteCustomer($id);

            return response()->json([
                'message' => 'Customer deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error deleting customer',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Settle customer credit
     */
    public function settleCredit(Request $request, $id)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0'
        ]);

        try {
            $this->customerService->settleCredit($id, $validated['amount']);

            return response()->json([
                'message' => 'Credit settled successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error settling credit',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get customer transaction history
     */
    public function transactions($id)
    {
        try {
            $transactions = $this->customerService->getTransactionHistory($id);

            return response()->json([
                'data' => $transactions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching transactions',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
