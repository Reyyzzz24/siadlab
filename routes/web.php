<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\EventController; // Pastikan ini diimport
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ItemLendingController;
use App\Http\Controllers\LabLendingController;
use App\Http\Controllers\MailArchiveController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\UserRoleController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\AdministratorController;

// --- GUEST ROUTES ---
// Mengarahkan data events ke Home/Index agar bisa dibaca komponen UpcomingEvent
Route::get('/', [EventController::class, 'index'])->name('home');

// --- AUTHENTICATED ROUTES ---
Route::middleware(['auth', 'verified'])->group(function () {
    // 0. Event Management Routes (Tambahkan Ini)
    Route::post('/events', [EventController::class, 'store'])->name('events.store');
    Route::delete('/events/{event}', [EventController::class, 'destroy'])->name('events.destroy');
    Route::post('/events/{event}/update', [EventController::class, 'update'])->name('events.update');

    // 1. Payment Services
    Route::middleware(['auth'])->prefix('payment')->name('payment.')->group(function () {
        // Pages Views
        Route::get('/dashboard', [PaymentController::class, 'dashboard'])->name('dashboard');
        Route::get('/list', [PaymentController::class, 'list'])->name('list')->middleware(\App\Http\Middleware\EnsureAdminOrPetugas::class);
        Route::get('/finance', [PaymentController::class, 'finance'])->name('finance');
        Route::get('/pay', [PaymentController::class, 'pay'])->name('pay');
        Route::get('/types', [PaymentController::class, 'types'])->name('types');
        Route::get('/history', [PaymentController::class, 'history'])->name('history');
        Route::get('/invoice', [PaymentController::class, 'invoice'])->name('invoice')->middleware(\App\Http\Middleware\EnsureAdminOrPetugas::class);
        Route::get('/tuition', [PaymentController::class, 'tuition'])->name('tuition')->middleware(\App\Http\Middleware\EnsureAdminOrPetugas::class);

        // Tuition / Master SPP Actions
        Route::prefix('tuition')->name('tuition.')->group(function () {
            Route::post('/', [PaymentController::class, 'tuitionStore'])->name('store');
            Route::put('/{id}', [PaymentController::class, 'tuitionUpdate'])->name('update');
            Route::post('/delete-selected', [PaymentController::class, 'tuitionDeleteSelected'])->name('delete-selected');
        });

        // Tagihan (Invoice) Actions
        Route::prefix('invoice')->name('invoice.')->group(function () {
            Route::post('/store-massal', [PaymentController::class, 'storeMassal'])->name('store_massal');
            Route::put('/{id}', [PaymentController::class, 'updateTagihan'])->name('update');
            Route::delete('/{id}', [PaymentController::class, 'destroyTagihan'])->name('destroy');
        });

        // Pembayaran (Payment List) Actions
        Route::post('/store', [PaymentController::class, 'storePembayaran'])->name('store');
        Route::post('/transfer-upload', [PaymentController::class, 'transferUpload'])->name('transfer_upload');
        Route::post('/bayar-selected', [PaymentController::class, 'bayarSelected'])->name('bayar_selected');
        Route::post('/{id}/approve', [PaymentController::class, 'approve'])->name('approve');
        Route::post('/{id}/reject', [PaymentController::class, 'reject'])->name('reject');
        Route::post('/{id}/cancel', [PaymentController::class, 'cancel'])->name('cancel');
        Route::delete('/list/{id}', [PaymentController::class, 'destroyPembayaran'])->name('destroy_pembayaran');
    });

    Route::prefix('item-lending')->name('item-lending.')->group(function () {
        // View Routes
        Route::get('/dashboard', [ItemLendingController::class, 'dashboard'])->name('dashboard');
        Route::get('/items', [ItemLendingController::class, 'items'])->name('items');

        // Action Routes untuk Barang (Sesuai form di Items.tsx)
        Route::post('/items', [ItemLendingController::class, 'storeItem'])->name('items.store');
        Route::put('/items/{id}', [ItemLendingController::class, 'updateItem'])->name('items.update');
        Route::post('/items/delete-selected', [ItemLendingController::class, 'deleteSelected'])->name('items.deleteSelected');

        // Halaman lainnya (Placeholder)
        Route::get('/list',  [ItemLendingController::class, 'list'])->name('list')->middleware(\App\Http\Middleware\EnsureAdminOrPetugas::class);
        Route::get('/lend', [ItemLendingController::class, 'lendNow'])->name('lend');
        // Actions for lending
        Route::post('/store', [ItemLendingController::class, 'storeLending'])->name('store');
        Route::post('/kembalikan-selected', [ItemLendingController::class, 'kembalikanSelected'])->name('kembalikanSelected');
        Route::post('/{id}/cancel', [ItemLendingController::class, 'cancel'])->name('cancel');
        Route::post('/{id}/approve', [ItemLendingController::class, 'approve'])->name('approve');
        Route::post('/{id}/return', [ItemLendingController::class, 'finalizeReturn'])->name('return');
        Route::post('/{id}/approve-back', [ItemLendingController::class, 'approveBack'])->name('approveBack');
        Route::post('/{id}/reject-back', [ItemLendingController::class, 'rejectBack'])->name('rejectBack');
        Route::get('/history', [ItemLendingController::class, 'history'])->name('history');
    });

    // 3. Lab Lending Services (controller-based)iu

    Route::prefix('lab-lending')->name('lab-lending.')->group(function () {
        Route::get('/dashboard', [LabLendingController::class, 'dashboard'])->name('dashboard');
        Route::get('/list', [LabLendingController::class, 'list'])->name('list')->middleware(\App\Http\Middleware\EnsureAdminOrPetugas::class);
        Route::get('/lend', [LabLendingController::class, 'lendNow'])->name('lend');
        Route::get('/history', [LabLendingController::class, 'history'])->name('history');
        Route::get('/laboratories', [LabLendingController::class, 'laboratories'])->name('labs');
        Route::post('/laboratories', [LabLendingController::class, 'storeLab'])->name('labs.store');
        Route::put('/laboratories/{id}', [LabLendingController::class, 'updateLab'])->name('labs.update');
        Route::post('/laboratories/delete-selected', [LabLendingController::class, 'deleteSelected'])->name('labs.deleteSelected');
        Route::post('/store', [LabLendingController::class, 'store'])->name('store');
        Route::post('/{id}/cancel', [LabLendingController::class, 'cancel'])->name('cancel');
        Route::post('/{id}/approve', [LabLendingController::class, 'approve'])->name('approve');
        Route::post('/{id}/reject', [LabLendingController::class, 'reject'])->name('reject');
        Route::post('/{id}/return', [LabLendingController::class, 'requestReturn'])->name('requestReturn');
        Route::post('/{id}/approve-back', [LabLendingController::class, 'approveBack'])->name('approveBack');
        Route::post('/{id}/reject-back', [LabLendingController::class, 'rejectBack'])->name('rejectBack');
        Route::post('/kembalikan-selected', [LabLendingController::class, 'kembalikanSelected'])->name('kembalikanSelected');
    });

    // 4. Mail Archive Services
    Route::prefix('mail-archive')->name('mail-archive.')->group(function () {
        Route::get('/dashboard', [MailArchiveController::class, 'dashboard'])->name('dashboard');
        Route::get('/incoming', [MailArchiveController::class, 'incoming'])->name('incoming');
        Route::get('/outgoing', [MailArchiveController::class, 'outgoing'])->name('outgoing');
        Route::post('/incoming/delete-selected', [MailArchiveController::class, 'deleteSelectedIncome'])->name('deleteSelected.income');
        Route::post('/outgoing/delete-selected', [MailArchiveController::class, 'deleteSelectedOutgoing'])->name('deleteSelected.outgoing');
        Route::post('/incoming', [MailArchiveController::class, 'storeIncome'])->name('store.income');
        Route::post('/outgoing', [MailArchiveController::class, 'storeOutgoing'])->name('store.outgoing');
        Route::post('/incoming/{id}', [MailArchiveController::class, 'updateIncome'])->name('update.income');
        Route::post('/outgoing/{id}', [MailArchiveController::class, 'updateOutgoing'])->name('update.outgoing');
        Route::get('/mail-archive/download/{id}/{type}', [MailArchiveController::class, 'downloadFile'])
            ->name('mail.download');
    });

    // 5. Role Management (Admin only)
    Route::get('/role/users', [UserRoleController::class, 'index'])->name('role.users')->middleware(\App\Http\Middleware\EnsureAdmin::class);
    Route::put('/role/users/{id}', [UserRoleController::class, 'update'])->name('role.users.update')->middleware(\App\Http\Middleware\EnsureAdmin::class);
    Route::delete('/role/users/bulk-delete', [UserRoleController::class, 'bulkDestroy'])->name('role.users.bulk-delete')->middleware(\App\Http\Middleware\EnsureAdmin::class);
    Route::post('/role/users', [UserRoleController::class, 'store'])->name('role.users.store')->middleware(\App\Http\Middleware\EnsureAdmin::class);
    Route::get('/role/students', [StudentController::class, 'index'])->name('students.index');

    // Notifications (API for frontend)
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/mark-read', [NotificationController::class, 'markAllRead'])->name('notifications.markAllRead');
    Route::delete('/role/students/bulk-delete', [StudentController::class, 'bulkDestroy'])->name('students.bulk-delete');
    Route::put('/role/students/{student}', [StudentController::class, 'update'])->name('students.update');
    Route::get('/role/staff', [StaffController::class, 'index'])->name('staff.index');
    Route::delete('/role/staff/bulk-delete', [StaffController::class, 'bulkDestroy'])->name('staff.bulk-delete');
    Route::put('/role/staff/{staff}', [StaffController::class, 'update'])->name('staff.update');
    Route::get('/role/administrators', [AdministratorController::class, 'index'])->name('admins.index');
    Route::delete('/admins/bulk-delete', [AdministratorController::class, 'bulkDestroy'])
        ->name('admins.bulk-delete');
    Route::put('/role/administrators/{administrator}', [AdministratorController::class, 'update'])->name('admins.update');
});

require __DIR__ . '/settings.php';
/* require __DIR__.'/auth.php'; // Biasanya Breeze/Fortify memisahkan route auth di sini */
