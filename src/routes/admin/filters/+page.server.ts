import { api } from '$lib/api';

export async function load() {
        try {
                // Get all attributes from products
                const statsData = await api.getAttributeStats();
                const filterSettings = await api.getFilterSettings().catch(() => ({ data: { enabled_filters: [] } }));
                
                return {
                        attributes: statsData?.data || [],
                        enabledFilters: filterSettings?.data?.enabled_filters || []
                };
        } catch (error) {
                console.error('Error loading filter settings:', error);
                return {
                        attributes: [],
                        enabledFilters: []
                };
        }
}
