<?php

namespace App\Listeners;

use App\Events\CustomerCreditExceeded;
use App\Models\User;
use Illuminate\Support\Facades\Notification;
use App\Notifications\CreditLimitExceededNotification;

class NotifyAdminOfCreditLimit
{
    /**
     * Handle the event.
     */
    public function handle(CustomerCreditExceeded $event): void
    {
        $admins = User::where('isAdmin', true)->get();
        
        Notification::send($admins, new CreditLimitExceededNotification($event->customer, $event->exceededAmount));
    }
}
