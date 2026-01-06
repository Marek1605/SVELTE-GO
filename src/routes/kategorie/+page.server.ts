import { api } from '$lib/api';

export async function load() {
	try {
		const categoriesRes = await api.getCategoriesTree();
		
		const categoriesTree = categoriesRes?.data || [];
		
		// Flatten tree for search/list view
		const flatCategories: any[] = [];
		
		function flatten(categories: any[], depth = 0) {
			for (const cat of categories) {
				flatCategories.push({
					...cat,
					depth,
					icon: cat.icon || getIcon(cat.slug, cat.name)
				});
				if (cat.children && cat.children.length > 0) {
					flatten(cat.children, depth + 1);
				}
			}
		}
		
		flatten(categoriesTree);
		
		// Sort by product count
		flatCategories.sort((a, b) => (b.product_count || 0) - (a.product_count || 0));
		
		return {
			categoriesTree: categoriesTree.map((cat: any) => ({
				...cat,
				icon: cat.icon || getIcon(cat.slug, cat.name)
			})),
			flatCategories
		};
	} catch (error) {
		console.error('Error loading categories:', error);
		return {
			categoriesTree: [],
			flatCategories: []
		};
	}
}

function getIcon(slug: string, name: string): string {
	const iconMap: Record<string, string> = {
		'elektronika': '📱', 'mobily': '📱', 'notebooky': '💻', 'pocitace': '🖥️',
		'flash-disk': '💾', 'ssd': '💿', 'routery': '📡', 'mysi': '🖱️',
		'kable': '🔌', 'hdmi': '🔌', 'krmivo': '🐕', 'mokre': '🐕',
		'suche': '🐈', 'lego': '🧱', 'hracky': '🧸', 'dom': '🏠',
		'zahrada': '🌳', 'moda': '👗', 'sport': '⚽', 'auto': '🚗',
		'zdravie': '💊', 'baterie': '🔋', 'lahodky': '🍖', 'klietky': '🐾'
	};
	
	for (const [key, icon] of Object.entries(iconMap)) {
		if (slug.includes(key) || name.toLowerCase().includes(key)) return icon;
	}
	return '📦';
}
