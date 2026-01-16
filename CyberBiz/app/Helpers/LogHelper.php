<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Log;

class LogHelper
{
    private static $logFile = 'sponsorship-debug.log';
    
    public static function log($message, $data = [])
    {
        $timestamp = now()->format('Y-m-d H:i:s');
        $logMessage = "[{$timestamp}] {$message}";
        
        if (!empty($data)) {
            $logMessage .= "\n" . json_encode($data, JSON_PRETTY_PRINT);
        }
        
        $logMessage .= "\n" . str_repeat('-', 80) . "\n";
        
        // Log to Laravel log
        Log::info($logMessage);
        
        // Also write to custom log file
        $logPath = storage_path('logs/' . self::$logFile);
        file_put_contents($logPath, $logMessage, FILE_APPEND);
    }
}

