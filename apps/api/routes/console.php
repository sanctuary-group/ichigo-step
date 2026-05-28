<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('broadcasts:process-scheduled')
    ->everyMinute()
    ->withoutOverlapping(5);

Schedule::command('scenarios:process-deliveries')
    ->everyMinute()
    ->withoutOverlapping(5);
