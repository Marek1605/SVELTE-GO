/**
 * SvelteKit server hooks - proxy /api/ requests to Go backend
 * 
 * Browser requests for /api/img/xxx.jpg and /api/v1/xxx go to Go backend.
 * Without this, SvelteKit returns 404 for these paths.
 */

const BACKEND_URL = process.env.BACKEND_URL || 'http://pc4kcc0ko0k0k08gk840cos0.46.224.7.54.sslip.io';

export async function handle({ event, resolve }) {
    // Proxy /api/ requests to Go backend
    if (event.url.pathname.startsWith('/api/')) {
        try {
            const targetUrl = BACKEND_URL + event.url.pathname + event.url.search;

            const headers = new Headers();
            const accept = event.request.headers.get('accept');
            if (accept) headers.set('Accept', accept);
            const contentType = event.request.headers.get('content-type');
            if (contentType) headers.set('Content-Type', contentType);
            const authorization = event.request.headers.get('authorization');
            if (authorization) headers.set('Authorization', authorization);

            const fetchOpts: RequestInit = {
                method: event.request.method,
                headers,
            };

            // Forward body for non-GET requests
            if (event.request.method !== 'GET' && event.request.method !== 'HEAD') {
                fetchOpts.body = await event.request.arrayBuffer();
            }

            const response = await fetch(targetUrl, fetchOpts);

            // Build response headers
            const respHeaders = new Headers();
            const forwardHeaders = [
                'content-type', 'cache-control', 'etag', 'last-modified',
                'x-cache', 'x-response-time', 'content-length'
            ];
            for (const h of forwardHeaders) {
                const val = response.headers.get(h);
                if (val) respHeaders.set(h, val);
            }

            // Add CORS for browser requests
            respHeaders.set('Access-Control-Allow-Origin', '*');

            return new Response(response.body, {
                status: response.status,
                headers: respHeaders,
            });
        } catch (e) {
            console.error('[proxy]', event.url.pathname, e);
            return new Response('Backend unavailable', { status: 502 });
        }
    }

    return resolve(event);
}
