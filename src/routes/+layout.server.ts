import { api } from '$lib/api';

export async function load() {
	try {
		const res = await api.getCategories();
		// Vyber len top kategórie s ikonou
		const topCategories = [
			{ slug: 'elektronika', name: 'Elektronika', icon: '📱' },
			{ slug: 'moda', name: 'Móda', icon: '👗' },
			{ slug: 'dom-zahrada', name: 'Dom a záhrada', icon: '🏠' },
			{ slug: 'sport', name: 'Šport', icon: '⚽' },
			{ slug: 'auto-moto', name: 'Auto-moto', icon: '🚗' },
			{ slug: 'zdravie', name: 'Zdravie', icon: '💊' },
			{ slug: 'detsky-svet', name: 'Detský svet', icon: '🧸' },
			{ slug: 'hobby', name: 'Hobby', icon: '🎨' }
		];
		return { categories: topCategories };
	} catch (e) {
		return { categories: [] };
	}
}
