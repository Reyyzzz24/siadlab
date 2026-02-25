<?php

namespace App\Concerns;

use App\Models\User;
use Illuminate\Validation\Rule;

trait ProfileValidationRules
{
    /**
     * Get the validation rules used to validate user profiles.
     *
     * @return array<string, array<int, \Illuminate\Contracts\Validation\Rule|array<mixed>|string>>
     */
    protected function profileRules(?int $userId = null): array
    {
        return [
            'name' => $this->nameRules(),
            'email' => $this->emailRules($userId),
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],

            // TAMBAHKAN FIELD-FIELD INI:
            'nim'           => ['nullable', 'string', 'max:20'],
            'program_studi' => ['nullable', 'string', 'max:100'],
            'kelas'         => ['nullable', 'string', 'max:50'],
            'no_telepon'    => ['nullable', 'string', 'max:20'],
            'no_induk'      => ['nullable', 'string', 'max:50'],
            'jabatan'       => ['nullable', 'string', 'max:100'],
            'bagian'        => ['nullable', 'string', 'max:100'],
            'tahun_masuk'   => ['nullable', 'string', 'max:4'],
        ];
    }

    /**
     * Get the validation rules used to validate user names.
     *
     * @return array<int, \Illuminate\Contracts\Validation\Rule|array<mixed>|string>
     */
    protected function nameRules(): array
    {
        return ['required', 'string', 'max:255'];
    }

    /**
     * Get the validation rules used to validate user emails.
     *
     * @return array<int, \Illuminate\Contracts\Validation\Rule|array<mixed>|string>
     */
    protected function emailRules(?int $userId = null): array
    {
        return [
            'required',
            'string',
            'email',
            'max:255',
            $userId === null
                ? Rule::unique(User::class)
                : Rule::unique(User::class)->ignore($userId),
        ];
    }
}
