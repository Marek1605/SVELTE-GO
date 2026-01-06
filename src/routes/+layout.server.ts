import { api } from '$lib/api';

export async function load() {
	try {
		const categoriesData = await api.getCategoriesTree();
		let navCategories = [];
		
		if (categoriesData?.data && Array.isArray(categoriesData.data)) {
			navCategories = categoriesData.data
				.sort((a, b) => (b.product_count || 0) - (a.product_count || 0))
				.slice(0, 8)
				.map((cat) => ({
					slug: cat.slug,
					name: cat.name,
					icon: cat.icon || '📦',
					product_count: cat.product_count || 0
				}));
		}
		
		if (navCategories.length === 0) {
			navCategories = [
				{ slug: 'mokre-krmivo', name: 'Mokré krmivo', icon: '🐕' },
				{ slug: 'suche-krmivo', name: 'Suché krmivo', icon: '🐈' },
				{ slug: 'flash-disk', name: 'Flash disky', icon: '💾' },
				{ slug: 'mysi', name: 'Myši', icon: '🖱️' },
				{ slug: 'ssd-disky', name: 'SSD disky', icon: '💿' },
				{ slug: 'routery', name: 'Routery', icon: '📡' },
				{ slug: 'hdmi-kable', name: 'HDMI káble', icon: '🔌' },
				{ slug: 'lego', name: 'Lego', icon: '🧱' }
			];
		}

		return { categories: navCategories, allCategories: categoriesData?.data || [] };
	} catch (error) {
		return { 
			categories: [
				{ slug: 'mokre-krmivo', name: 'Mokré krmivo', icon: '🐕' },
				{ slug: 'suche-krmivo', name: 'Suché krmivo', icon: '🐈' },
				{ slug: 'flash-disk', name: 'Flash disky', icon: '💾' },
				{ slug: 'mysi', name: 'Myši', icon: '🖱️' },
				{ slug: 'ssd-disky', name: 'SSD disky', icon: '💿' },
				{ slug: 'routery', name: 'Routery', icon: '📡' },
				{ slug: 'hdmi-kable', name: 'HDMI káble', icon: '🔌' },
				{ slug: 'lego', name: 'Lego', icon: '🧱' }
			],
			allCategories: []
		};
	}
}
