export async function load() {
	const topCategories = [
		{ slug: 'mokre-krmivo', name: 'Mokré krmivo', icon: '🐕' },
		{ slug: 'suche-krmivo', name: 'Suché krmivo', icon: '🐈' },
		{ slug: 'flash-disk', name: 'Flash disky', icon: '💾' },
		{ slug: 'mysi', name: 'Myši', icon: '🖱️' },
		{ slug: 'ssd-disky', name: 'SSD disky', icon: '💿' },
		{ slug: 'routery', name: 'Routery', icon: '📡' },
		{ slug: 'hdmi-kable', name: 'HDMI káble', icon: '🔌' },
		{ slug: 'lego', name: 'Lego', icon: '🧱' }
	];
	return { categories: topCategories };
}
