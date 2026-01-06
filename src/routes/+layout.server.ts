import { api } from '$lib/api';

export async function load() {
	try {
		// Load categories tree from API
		const categoriesData = await api.getCategoriesTree();
		
		// Get top-level categories with most products for navigation
		let navCategories = [];
		
		if (categoriesData?.data && Array.isArray(categoriesData.data)) {
			// Sort by product count and take top 8
			navCategories = categoriesData.data
				.sort((a: any, b: any) => (b.product_count || 0) - (a.product_count || 0))
				.slice(0, 8)
				.map((cat: any) => ({
					slug: cat.slug,
					name: cat.name,
					icon: cat.icon || getCategoryIcon(cat.slug, cat.name),
					product_count: cat.product_count || 0
				}));
		}
		
		// Fallback to hardcoded if API fails
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

		return { 
			categories: navCategories,
			allCategories: categoriesData?.data || []
		};
	} catch (error) {
		console.error('Failed to load categories:', error);
		// Fallback categories
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

// Helper function to assign icons based on category name/slug
function getCategoryIcon(slug: string, name: string): string {
	const iconMap: Record<string, string> = {
		// Electronics
		'elektronika': '📱',
		'mobily': '📱',
		'tablety': '📱',
		'notebooky': '💻',
		'pocitace': '🖥️',
		'monitory': '🖥️',
		'televizory': '📺',
		'audio': '🎧',
		'sluchadla': '🎧',
		'foto': '📷',
		'kamery': '📹',
		'gaming': '🎮',
		'hry': '🎮',
		
		// Storage
		'flash-disk': '💾',
		'ssd': '💿',
		'hdd': '💿',
		'pamate': '💾',
		
		// Networking
		'routery': '📡',
		'sietove': '🌐',
		'wifi': '📶',
		
		// Peripherals
		'mysi': '🖱️',
		'klavesnice': '⌨️',
		'tlacarne': '🖨️',
		
		// Cables
		'kable': '🔌',
		'hdmi': '🔌',
		'usb': '🔌',
		
		// Home & Garden
		'dom': '🏠',
		'zahrada': '🌳',
		'nabytok': '🛋️',
		'kuchyna': '🍳',
		
		// Pets
		'krmivo': '🐕',
		'mokre-krmivo': '🐕',
		'suche-krmivo': '🐈',
		'mazlicky': '🐾',
		
		// Fashion
		'moda': '👗',
		'oblecenie': '👕',
		'obuv': '👟',
		'doplnky': '👜',
		
		// Sports
		'sport': '⚽',
		'fitness': '💪',
		'outdoor': '🏕️',
		'cyklo': '🚴',
		
		// Auto
		'auto': '🚗',
		'moto': '🏍️',
		'autodiely': '🔧',
		
		// Health
		'zdravie': '💊',
		'kozmetika': '💄',
		'lekaren': '💉',
		
		// Kids
		'detsky': '🧸',
		'hracky': '🧸',
		'lego': '🧱',
		'kocarky': '👶',
		
		// Hobby
		'hobby': '🎨',
		'knihy': '📚',
		'hudba': '🎵',
		'filmy': '🎬',
	};
	
	// Check slug first
	for (const [key, icon] of Object.entries(iconMap)) {
		if (slug.includes(key)) {
			return icon;
		}
	}
	
	// Check name
	const nameLower = name.toLowerCase();
	for (const [key, icon] of Object.entries(iconMap)) {
		if (nameLower.includes(key)) {
			return icon;
		}
	}
	
	// Default icon
	return '📦';
}
