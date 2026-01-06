import { api } from '$lib/api';

export async function load() {
	try {
		// Load data in parallel
		const [categoriesRes, productsRes, dashboardRes] = await Promise.all([
			api.getCategoriesTree().catch(() => null),
			api.getProducts('limit=8&sort=newest').catch(() => null),
			api.getDashboard().catch(() => null)
		]);
		
		// Process categories - get top ones with most products
		let popularCategories = [];
		if (categoriesRes?.data && Array.isArray(categoriesRes.data)) {
			popularCategories = categoriesRes.data
				.filter((cat: any) => cat.product_count > 0)
				.sort((a: any, b: any) => (b.product_count || 0) - (a.product_count || 0))
				.slice(0, 12)
				.map((cat: any) => ({
					slug: cat.slug,
					name: cat.name,
					icon: cat.icon || getCategoryIcon(cat.slug, cat.name),
					product_count: cat.product_count || 0
				}));
		}
		
		// Fallback categories if API fails
		if (popularCategories.length === 0) {
			popularCategories = [
				{ slug: 'mokre-krmivo', name: 'Mokré krmivo', icon: '🐕', product_count: 725 },
				{ slug: 'suche-krmivo', name: 'Suché krmivo', icon: '🐈', product_count: 419 },
				{ slug: 'flash-disk', name: 'Flash disky', icon: '💾', product_count: 101 },
				{ slug: 'mysi', name: 'Myši', icon: '🖱️', product_count: 60 },
				{ slug: 'ssd-disky', name: 'SSD disky', icon: '💿', product_count: 59 },
				{ slug: 'routery', name: 'Routery', icon: '📡', product_count: 53 },
				{ slug: 'hdmi-kable', name: 'HDMI káble', icon: '🔌', product_count: 41 },
				{ slug: 'lego', name: 'Lego', icon: '🧱', product_count: 38 },
				{ slug: 'pocitacove-skrine', name: 'PC skrine', icon: '🖥️', product_count: 53 },
				{ slug: 'baterie', name: 'Batérie', icon: '🔋', product_count: 57 },
				{ slug: 'prepojovaci-kabel', name: 'Káble', icon: '🔌', product_count: 60 },
				{ slug: 'lahodky', name: 'Lahôdky', icon: '🍖', product_count: 317 }
			];
		}
		
		// Process products
		let featuredProducts = [];
		if (productsRes?.data && Array.isArray(productsRes.data)) {
			featuredProducts = productsRes.data;
		}
		
		// Stats
		const stats = dashboardRes?.data || {
			products: 4998,
			categories: 531,
			vendors: 500
		};
		
		return {
			popularCategories,
			featuredProducts,
			stats
		};
	} catch (error) {
		console.error('Error loading homepage:', error);
		return {
			popularCategories: [],
			featuredProducts: [],
			stats: { products: 5000, categories: 500, vendors: 500 }
		};
	}
}

// Helper function to get icons
function getCategoryIcon(slug: string, name: string): string {
	const iconMap: Record<string, string> = {
		'elektronika': '📱',
		'mobily': '📱',
		'notebooky': '💻',
		'pocitace': '🖥️',
		'flash-disk': '💾',
		'ssd': '💿',
		'routery': '📡',
		'mysi': '🖱️',
		'kable': '🔌',
		'hdmi': '🔌',
		'krmivo': '🐕',
		'mokre-krmivo': '🐕',
		'suche-krmivo': '🐈',
		'lego': '🧱',
		'hracky': '🧸',
		'dom': '🏠',
		'zahrada': '🌳',
		'moda': '👗',
		'sport': '⚽',
		'auto': '🚗',
		'zdravie': '💊',
		'baterie': '🔋',
		'lahodky': '🍖'
	};
	
	for (const [key, icon] of Object.entries(iconMap)) {
		if (slug.includes(key) || name.toLowerCase().includes(key)) {
			return icon;
		}
	}
	
	return '📦';
}
