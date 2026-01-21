<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleCors
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Handle preflight OPTIONS requests
        if ($request->getMethod() === 'OPTIONS') {
            $origin = $request->header('Origin');
            $allowedOrigins = [
                'http://localhost:8080',
                'http://localhost:3000',
                'http://localhost:5173',
                'http://127.0.0.1:8080',
                'http://127.0.0.1:3000',
                'http://127.0.0.1:5173',
                'https://cyberbizafrica.com',
                'https://www.cyberbizafrica.com',
                'https://cyberbiz.lula.com.et',
                'https://www.cyberbiz.lula.com.et',
            ];
            
            if ($origin && in_array($origin, $allowedOrigins)) {
                return response('', 200)
                    ->header('Access-Control-Allow-Origin', $origin)
                    ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
                    ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-XSRF-TOKEN, Accept, Origin')
                    ->header('Access-Control-Allow-Credentials', 'true')
                    ->header('Access-Control-Max-Age', '3600');
            }
            
            return response('', 200);
        }

        $response = $next($request);
        
        // Add CORS headers to response
        $origin = $request->header('Origin');
        $allowedOrigins = [
            'http://localhost:8080',
            'http://localhost:3000',
            'http://localhost:5173',
            'http://127.0.0.1:8080',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5173',
            'https://cyberbizafrica.com',
            'https://www.cyberbizafrica.com',
            'https://cyberbiz.lula.com.et',
            'https://www.cyberbiz.lula.com.et',
        ];
        
        if ($origin && in_array($origin, $allowedOrigins)) {
            // For StreamedResponse and other Symfony responses, use headers->set()
            $response->headers->set('Access-Control-Allow-Origin', $origin);
            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-XSRF-TOKEN, Accept, Origin');
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
            $response->headers->set('Access-Control-Max-Age', '3600');
        }

        return $response;
    }
}

