import { writable } from 'svelte/store';
import { browser } from '$app/environment';

interface Vendor {
    id: string;
    email: string;
    company_name: string;
    contact_person: string;
    status: string;
}

interface Shop {
    id: string;
    shop_name: string;
    shop_slug: string;
    shop_url: string;
    status: string;
    display_mode: string;
    credit: number;
}

interface AuthState {
    isLoggedIn: boolean;
    token: string | null;
    vendor: Vendor | null;
    shop: Shop | null;
    loading: boolean;
}

const initialState: AuthState = {
    isLoggedIn: false,
    token: null,
    vendor: null,
    shop: null,
    loading: true
};

function createAuthStore() {
    const { subscribe, set, update } = writable<AuthState>(initialState);

    // Load from localStorage on init
    if (browser) {
        const token = localStorage.getItem('vendor_token');
        if (token) {
            update(state => ({ ...state, token, loading: true }));
            // Verify token
            checkAuth(token);
        } else {
            update(state => ({ ...state, loading: false }));
        }
    }

    async function checkAuth(token: string) {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://pc4kcc0ko0k0k08gk840cos0.46.224.7.54.sslip.io/api/v1';
        
        try {
            const res = await fetch(`${API_BASE}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    set({
                        isLoggedIn: true,
                        token,
                        vendor: data.data.vendor,
                        shop: data.data.shop,
                        loading: false
                    });
                    return;
                }
            }
            
            // Token invalid
            logout();
        } catch (e) {
            logout();
        }
    }

    async function login(email: string, password: string, rememberMe: boolean = false): Promise<{ success: boolean; error?: string }> {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://pc4kcc0ko0k0k08gk840cos0.46.224.7.54.sslip.io/api/v1';
        
        try {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, remember_me: rememberMe })
            });
            
            const data = await res.json();
            
            if (data.success) {
                if (browser) {
                    localStorage.setItem('vendor_token', data.data.token);
                    if (rememberMe) {
                        // Token expires in 30 days if remember me, otherwise 24 hours
                        localStorage.setItem('vendor_token_expires', String(Date.now() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000));
                    }
                }
                
                set({
                    isLoggedIn: true,
                    token: data.data.token,
                    vendor: data.data.vendor,
                    shop: data.data.shop,
                    loading: false
                });
                
                return { success: true };
            }
            
            return { success: false, error: data.error };
        } catch (e) {
            return { success: false, error: 'Chyba pripojenia' };
        }
    }

    async function register(data: {
        first_name: string;
        last_name: string;
        email: string;
        password: string;
        password_confirm: string;
        shop_name: string;
        shop_url: string;
        terms: boolean;
    }): Promise<{ success: boolean; error?: string }> {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://pc4kcc0ko0k0k08gk840cos0.46.224.7.54.sslip.io/api/v1';
        
        try {
            const res = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            const result = await res.json();
            
            if (result.success) {
                return { success: true };
            }
            
            return { success: false, error: result.error };
        } catch (e) {
            return { success: false, error: 'Chyba pripojenia' };
        }
    }

    function logout() {
        if (browser) {
            const token = localStorage.getItem('vendor_token');
            if (token) {
                const API_BASE = import.meta.env.VITE_API_URL || 'http://pc4kcc0ko0k0k08gk840cos0.46.224.7.54.sslip.io/api/v1';
                fetch(`${API_BASE}/auth/logout`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                }).catch(() => {});
            }
            localStorage.removeItem('vendor_token');
        }
        
        set({
            isLoggedIn: false,
            token: null,
            vendor: null,
            shop: null,
            loading: false
        });
    }

    return {
        subscribe,
        login,
        register,
        logout,
        checkAuth
    };
}

export const auth = createAuthStore();
