import { w as writable } from './index-BHQWOfgY.js';
import { B as BROWSER } from './false-CRHihH2U.js';

const browser = BROWSER;
const initialState = {
  isLoggedIn: false,
  token: null,
  vendor: null,
  shop: null,
  loading: true
};
function createAuthStore() {
  const { subscribe, set, update } = writable(initialState);
  async function checkAuth(token) {
    const API_BASE = "http://pc4kcc0ko0k0k08gk840cos0.46.224.7.54.sslip.io/api/v1";
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { "Authorization": `Bearer ${token}` }
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
      logout();
    } catch (e) {
      logout();
    }
  }
  async function login(email, password, rememberMe = false) {
    const API_BASE = "http://pc4kcc0ko0k0k08gk840cos0.46.224.7.54.sslip.io/api/v1";
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember_me: rememberMe })
      });
      const data = await res.json();
      if (data.success) {
        if (browser) ;
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
      return { success: false, error: "Chyba pripojenia" };
    }
  }
  async function register(data) {
    const API_BASE = "http://pc4kcc0ko0k0k08gk840cos0.46.224.7.54.sslip.io/api/v1";
    const fullName = `${data.first_name} ${data.last_name}`.trim();
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: fullName,
          // Pre stĺpec "name" v DB
          company_name: data.shop_name,
          // Použijeme shop_name ako company_name
          contact_person: fullName,
          // Kontaktná osoba
          shop_name: data.shop_name,
          shop_url: data.shop_url
        })
      });
      const result = await res.json();
      if (result.success) {
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (e) {
      return { success: false, error: "Chyba pripojenia" };
    }
  }
  function logout() {
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
createAuthStore();
//# sourceMappingURL=auth-CzuvcCeF.js.map
