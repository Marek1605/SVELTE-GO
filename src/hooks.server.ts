const BACKEND_URL = process.env.BACKEND_URL || 'http://pc4kcc0ko0k0k08gk840cos0.46.224.7.54.sslip.io';

export async function handle({ event, resolve }) {
    if (event.url.pathname.startsWith('/api/')) {
        try {
            const targetUrl = BACKEND_URL + event.url.pathname + event.url.search;
            const headers = new Headers();
            for (const h of ['accept', 'content-type', 'authorization']) {
                const val = event.request.headers.get(h);
                if (val) headers.set(h, val);
            }
            const fetchOpts = { method: event.request.method, headers };
            if (event.request.method !== 'GET' && event.request.method !== 'HEAD') {
                fetchOpts.body = await event.request.arrayBuffer();
            }
            const response = await fetch(targetUrl, fetchOpts);
            const respHeaders = new Headers();
            for (const h of ['content-type','cache-control','etag','last-modified','x-cache','content-length']) {
                const val = response.headers.get(h);
                if (val) respHeaders.set(h, val);
            }
            return new Response(response.body, { status: response.status, headers: respHeaders });
        } catch (e) {
            console.error('[proxy]', event.url.pathname, e);
            return new Response('Backend unavailable', { status: 502 });
        }
    }
    return resolve(event);
}
