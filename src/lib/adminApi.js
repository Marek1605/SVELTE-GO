// Shared admin API helper with Basic Auth
export const API_BASE = 'http://pc4kcc0ko0k0k08gk840cos0.46.224.7.54.sslip.io/api/v1';

function getAuth() {
    if (typeof window === 'undefined') return {};
    const u = localStorage.getItem('adm_u');
    const p = localStorage.getItem('adm_p');
    if (!u || !p) return {};
    return { 'Authorization': 'Basic ' + btoa(u + ':' + p) };
}

export async function adminFetch(endpoint, opts = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    try {
        const r = await fetch(url, {
            ...opts,
            headers: {
                'Content-Type': 'application/json',
                ...getAuth(),
                ...opts.headers,
            },
        });
        if (r.status === 401) {
            localStorage.removeItem('adm_u');
            localStorage.removeItem('adm_p');
            window.location.reload();
            return { success: false, error: 'Unauthorized' };
        }
        return await r.json();
    } catch (e) {
        return { success: false, error: e.message };
    }
}

// Raw fetch with auth (for non-JSON responses like file downloads)
export async function adminRawFetch(url, opts = {}) {
    return fetch(url, {
        ...opts,
        headers: {
            ...getAuth(),
            ...opts.headers,
        },
    });
}
