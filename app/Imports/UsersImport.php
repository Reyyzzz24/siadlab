<?php

namespace App\Imports;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Collection;

class UsersImport implements ToCollection, WithHeadingRow
{
    /**
     * @param Collection $rows
     */
    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            $email = $row['email'] ?? null;
            if (!$email) continue;

            $user = User::where('email', $email)->first();

            $attrs = [];
            if (isset($row['name'])) $attrs['name'] = (string) $row['name'];
            if (isset($row['role'])) $attrs['role'] = (string) $row['role'];
            if (isset($row['password']) && $row['password'] !== '') $attrs['password'] = Hash::make((string) $row['password']);

            if ($user) {
                if (!empty($attrs)) {
                    $user->update($attrs);
                }
            } else {
                $create = [
                    'email' => $email,
                    'name' => $attrs['name'] ?? ($row['name'] ?? $email),
                    'password' => $attrs['password'] ?? Hash::make(bin2hex(random_bytes(6))),
                    'role' => $attrs['role'] ?? 'user',
                ];

                User::create($create);
            }
        }
    }
}
