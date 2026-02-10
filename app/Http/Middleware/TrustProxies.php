<?php

namespace App\Http\Middleware;

use Illuminate\Http\Middleware\TrustProxies as Middleware;
use Illuminate\Http\Request;

class TrustProxies extends Middleware
{
    /**
     * Trust the reverse proxy. Since Apache is on the same host and is the only proxy,
     * trusting all is acceptable here. If you want stricter, replace '*' with '127.0.0.1'.
     *
     * @var array<int, string>|string|null
     */
    protected $proxies = '*';

    /**
     * Use all standard X-Forwarded-* headers so Laravel correctly detects:
     * - HTTPS scheme (X-Forwarded-Proto)
     * - Host (X-Forwarded-Host)
     * - Port (X-Forwarded-Port)
     * - Client IP chain (X-Forwarded-For)
     *
     * @var int
     */
    protected $headers = Request::HEADER_X_FORWARDED_ALL;
}
