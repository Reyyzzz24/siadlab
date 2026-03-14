<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log; // Tambahkan ini agar tidak error 'Log'
use App\Models\Pembayaran;
use App\Models\PeminjamanBarang;
use App\Models\PeminjamanLab;
use App\Models\SuratMasuk;
use App\Models\SuratKeluar;
use App\Models\NotificationCustom;
use App\Events\NotificationCreated;
use Masbug\Flysystem\GoogleDriveAdapter;
use League\Flysystem\Filesystem;
use Google\Client as GoogleClient;
use Google\Service\Drive as GoogleDrive;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
         /* URL::forceScheme('https'); */
        // Tetap jalankan default konfigurasi kamu
        $this->configureDefaults();

        // Register model listeners to create notifications on status changes
        try {
            Pembayaran::updated(function ($model) {
                if ($model->wasChanged('status')) {
                    $message = 'Pembayaran: status ' . $model->status;
                    $notification = NotificationCustom::create([
                        'user_id' => $model->user_id,
                        'type' => 'pembayaran',
                        'data' => ['message' => $message, 'model_id' => $model->id, 'status' => $model->status],
                    ]);
                    event(new NotificationCreated($notification));
                }
            });

            PeminjamanBarang::updated(function ($model) {
                if ($model->wasChanged('status')) {
                    $message = 'Peminjaman barang: status ' . $model->status;
                    $notification = NotificationCustom::create([
                        'user_id' => $model->user_id,
                        'type' => 'item_lending',
                        'data' => ['message' => $message, 'model_id' => $model->id, 'status' => $model->status],
                    ]);
                    event(new NotificationCreated($notification));
                }
            });

            PeminjamanLab::updated(function ($model) {
                if ($model->wasChanged('status')) {
                    $message = 'Peminjaman lab: status ' . $model->status;
                    $notification = NotificationCustom::create([
                        'user_id' => $model->user_id,
                        'type' => 'lab_lending',
                        'data' => ['message' => $message, 'model_id' => $model->id, 'status' => $model->status],
                    ]);
                    event(new NotificationCreated($notification));
                }
            });

            // Notify penerima when incoming mail is created
            SuratMasuk::created(function ($model) {
                $message = 'Surat masuk diterima: ' . ($model->perihal ?? '');
                $notification = NotificationCustom::create([
                    'user_id' => $model->penerima_id,
                    'type' => 'mail_incoming',
                    'data' => ['message' => $message, 'model_id' => $model->id],
                ]);
                event(new NotificationCreated($notification));
            });

            // Notify pengirim when outgoing mail is created
            SuratKeluar::created(function ($model) {
                $message = 'Surat keluar dibuat: ' . ($model->perihal ?? '');
                $notification = NotificationCustom::create([
                    'user_id' => $model->pengirim_id,
                    'type' => 'mail_outgoing',
                    'data' => ['message' => $message, 'model_id' => $model->id],
                ]);
                event(new NotificationCreated($notification));
            });
        } catch (\Throwable $e) {
            Log::debug('Notification listeners registration skipped: ' . $e->getMessage());
        }

        // 1. Logika Force HTTPS
       /*  URL::forceScheme('https'); */

        // 2. Registrasi Driver Google Drive
        try {
            Storage::extend('google', function ($app, $config) {
                $client = new GoogleClient();
                $client->setClientId($config['clientId']);
                $client->setClientSecret($config['clientSecret']);
                $client->setHttpClient(new \GuzzleHttp\Client(['verify' => false]));
                $client->fetchAccessTokenWithRefreshToken($config['refreshToken']);

                $service = new GoogleDrive($client);

                // Ambil ID folder dari config
                $rootFolderId = $config['folderId'] ?? null;

                // Inisialisasi adapter dengan ID folder sebagai root
                $adapter = new GoogleDriveAdapter($service, $rootFolderId);

                return new \Illuminate\Filesystem\FilesystemAdapter(
                    new \League\Flysystem\Filesystem($adapter),
                    $adapter,
                    $config
                );
            });
        } catch (\Exception $e) {
            Log::error("Google Drive Driver Error: " . $e->getMessage());
        }
    }

    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(
            fn(): ?Password => app()->isProduction()
                ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
                : null
        );
    }
}
