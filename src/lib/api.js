
// Admin delete functions
export async function deleteAllCategories() {
    return fetchApi('/admin/categories/all', { method: 'DELETE' });
}

export async function deleteAllProducts() {
    return fetchApi('/admin/products/all', { method: 'DELETE' });
}
