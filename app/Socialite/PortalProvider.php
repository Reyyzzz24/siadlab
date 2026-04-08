<?php

namespace App\Socialite;

use Illuminate\Support\Arr;
use Laravel\Socialite\Two\AbstractProvider;
use Laravel\Socialite\Two\ProviderInterface;
use Laravel\Socialite\Two\User;

class PortalProvider extends AbstractProvider implements ProviderInterface
{
    protected $scopes = [];
    protected $scopeSeparator = ' ';

    protected function getPortalHost(): string
    {
        return rtrim(config('services.portal.host'), '/');
    }

    protected function getAuthUrl($state): string
    {
        return $this->buildAuthUrlFromBase(
            $this->getPortalHost().'/oauth/authorize',
            $state
        );
    }

    protected function getTokenUrl(): string
    {
        return $this->getPortalHost().'/oauth/token';
    }

    protected function getUserByToken($token): array
    {
        $response = $this->getHttpClient()->get(
            $this->getPortalHost().'/api/user',
            [
                'headers' => [
                    'Authorization' => 'Bearer '.$token,
                ],
            ]
        );

        return json_decode($response->getBody(), true);
    }

    protected function mapUserToObject(array $user): User
    {
        return (new User)->setRaw($user)->map([
            'id' => Arr::get($user, 'id'),
            'nickname' => Arr::get($user, 'name'),
            'name' => Arr::get($user, 'name'),
            'email' => Arr::get($user, 'email'),
            'profile_photo_path' => null,
        ]);
    }
}