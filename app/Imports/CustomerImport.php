<?php

namespace App\Imports;

use App\Models\Customer;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class CustomerImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        return new Customer([
            'name'          => $row['name'],
            'email'         => $row['email'] ?? null,
            'contactNumber' => $row['contact_number'] ?? $row['phone'] ?? null,
            'address'       => $row['address'] ?? null,
            'creditLimit'   => $row['credit_limit'] ?? 0,
            'status'        => 'active',
            'availability'  => true,
        ]);
    }
}
