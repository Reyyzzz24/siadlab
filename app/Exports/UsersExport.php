<?php

namespace App\Exports;

use App\Models\User;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class UsersExport implements FromCollection, WithHeadings
{
    /**
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function collection()
    {
        return User::select('id', 'name', 'email', 'role')->orderBy('name')->get();
    }

    public function headings(): array
    {
        return ['id', 'name', 'email', 'role'];
    }
}
