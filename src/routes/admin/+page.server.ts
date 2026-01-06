import { api } from '$lib/api';

export async function load() {
	try {
		const res = await api.getAdminDashboard();
		return {
			dashboard: res.success ? res.data : null
		};
	} catch (e) {
		return { dashboard: null };
	}
}
