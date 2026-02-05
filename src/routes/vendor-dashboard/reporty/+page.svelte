<script>
    import { getContext, onMount } from 'svelte';
    import { browser } from '$app/environment';
    
    const vendorStore = getContext('vendor');
    const shopStore = getContext('shop');
    const API_BASE = getContext('API_BASE');
    
    $: vendor = $vendorStore;
    $: shop = $shopStore;
    
    let loading = true;
    let transactions = [];
    let filterType = 'all';
    let dateFrom = '';
    let dateTo = '';
    
    // Summary
    let summary = {
        totalTopup: 0,
        totalSpent: 0,
        totalClicks: 0
    };
    
    onMount(async () => {
        if (!browser) return;
        await loadTransactions();
    });
    
    async function loadTransactions() {
        loading = true;
        const token = localStorage.getItem('vendor_token');
        if (!token) return;
        
        try {
            const res = await fetch(`${API_BASE}/vendor/transactions`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.data) {
                transactions = data.data;
                calculateSummary();
            }
        } catch (e) {
            console.error('Error loading transactions:', e);
        }
        loading = false;
    }
    
    function calculateSummary() {
        summary = {
            totalTopup: 0,
            totalSpent: 0,
            totalClicks: 0
        };
        
        transactions.forEach(tx => {
            if (tx.type === 'topup' && tx.amount > 0) {
                summary.totalTopup += tx.amount;
            } else if (tx.type === 'click' || tx.amount < 0) {
                summary.totalSpent += Math.abs(tx.amount);
                summary.totalClicks++;
            }
        });
    }
    
    function formatNumber(num, decimals = 0) {
        return (num || 0).toLocaleString('sk-SK', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    }
    
    function formatDate(dateStr) {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('sk-SK', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    function exportCSV() {
        const headers = ['Dátum', 'Typ', 'Suma', 'Zostatok', 'Popis'];
        const rows = filteredTransactions.map(tx => [
            formatDate(tx.created_at),
            tx.type,
            tx.amount,
            tx.balance_after,
            tx.description || ''
        ]);
        
        const csv = [headers, ...rows].map(row => row.join(';')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `report-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    }
    
    $: filteredTransactions = transactions.filter(tx => {
        if (filterType !== 'all' && tx.type !== filterType) return false;
        if (dateFrom && new Date(tx.created_at) < new Date(dateFrom)) return false;
        if (dateTo && new Date(tx.created_at) > new Date(dateTo + 'T23:59:59')) return false;
        return true;
    });
</script>

<div class="reports-container">
    <div class="reports-header">
        <button class="export-btn" on:click={exportCSV}>
            📥 Exportovať CSV
        </button>
    </div>
    
    {#if loading}
        <div class="loading">
            <div class="spinner"></div>
            <p>Načítavam reporty...</p>
        </div>
    {:else}
        <!-- Summary Cards -->
        <div class="summary-grid">
            <div class="summary-card success">
                <span class="summary-icon">💵</span>
                <div class="summary-content">
                    <span class="summary-value">{formatNumber(summary.totalTopup, 2)} €</span>
                    <span class="summary-label">Celkom dobitý kredit</span>
                </div>
            </div>
            <div class="summary-card danger">
                <span class="summary-icon">💸</span>
                <div class="summary-content">
                    <span class="summary-value">{formatNumber(summary.totalSpent, 2)} €</span>
                    <span class="summary-label">Celkom minuté</span>
                </div>
            </div>
            <div class="summary-card info">
                <span class="summary-icon">👆</span>
                <div class="summary-content">
                    <span class="summary-value">{formatNumber(summary.totalClicks)}</span>
                    <span class="summary-label">Počet preklikov</span>
                </div>
            </div>
        </div>
        
        <!-- Filters -->
        <div class="filters">
            <div class="filter-group">
                <label>Typ transakcie</label>
                <select bind:value={filterType}>
                    <option value="all">Všetky</option>
                    <option value="topup">Dobíjanie</option>
                    <option value="click">Prekliky</option>
                    <option value="deduction">Odpočítanie</option>
                </select>
            </div>
            <div class="filter-group">
                <label>Od</label>
                <input type="date" bind:value={dateFrom}>
            </div>
            <div class="filter-group">
                <label>Do</label>
                <input type="date" bind:value={dateTo}>
            </div>
        </div>
        
        <!-- Transactions Table -->
        <div class="transactions-section">
            <h2>História transakcií ({filteredTransactions.length})</h2>
            
            {#if filteredTransactions.length === 0}
                <div class="no-data">
                    <span class="no-data-icon">📋</span>
                    <p>Žiadne transakcie pre zvolené filtre</p>
                </div>
            {:else}
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Dátum</th>
                                <th>Typ</th>
                                <th>Suma</th>
                                <th>Zostatok</th>
                                <th>Popis</th>
                                <th>Stav</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each filteredTransactions as tx}
                                <tr>
                                    <td>{formatDate(tx.created_at)}</td>
                                    <td>
                                        {#if tx.type === 'topup'}
                                            <span class="badge badge-success">💵 Dobíjanie</span>
                                        {:else if tx.type === 'click'}
                                            <span class="badge badge-info">👆 Preklik</span>
                                        {:else if tx.type === 'deduction'}
                                            <span class="badge badge-warning">➖ Odpočítanie</span>
                                        {:else}
                                            <span class="badge badge-secondary">{tx.type}</span>
                                        {/if}
                                    </td>
                                    <td class="amount {tx.amount >= 0 ? 'positive' : 'negative'}">
                                        {tx.amount >= 0 ? '+' : ''}{formatNumber(tx.amount, 2)} €
                                    </td>
                                    <td>{formatNumber(tx.balance_after, 2)} €</td>
                                    <td class="description">{tx.description || '-'}</td>
                                    <td>
                                        {#if tx.status === 'completed'}
                                            <span class="status-dot completed"></span> Dokončené
                                        {:else if tx.status === 'pending'}
                                            <span class="status-dot pending"></span> Čaká
                                        {:else}
                                            <span class="status-dot"></span> {tx.status}
                                        {/if}
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            {/if}
        </div>
    {/if}
</div>

<style>
.reports-container {
    max-width: 1200px;
    margin: 0 auto;
}

.reports-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.reports-header h1 {
    font-size: 28px;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
}

.export-btn {
    padding: 10px 20px;
    background: #10b981;
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.export-btn:hover {
    background: #059669;
}

.loading {
    text-align: center;
    padding: 60px;
    color: #6b7280;
}

.spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e5e7eb;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 16px;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Summary Grid */
.summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
}

.summary-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    border-left: 4px solid #e5e7eb;
}

.summary-card.success {
    border-left-color: #10b981;
}

.summary-card.danger {
    border-left-color: #ef4444;
}

.summary-card.info {
    border-left-color: #3b82f6;
}

.summary-icon {
    font-size: 32px;
}

.summary-value {
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
    display: block;
}

.summary-label {
    font-size: 13px;
    color: #6b7280;
}

/* Filters */
.filters {
    display: flex;
    gap: 16px;
    margin-bottom: 24px;
    flex-wrap: wrap;
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.filter-group label {
    font-size: 12px;
    font-weight: 500;
    color: #6b7280;
}

.filter-group select,
.filter-group input {
    padding: 8px 12px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 14px;
    background: white;
}

.filter-group select:focus,
.filter-group input:focus {
    outline: none;
    border-color: #3b82f6;
}

/* Transactions Section */
.transactions-section {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.transactions-section h2 {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin: 0 0 20px 0;
}

.no-data {
    text-align: center;
    padding: 40px;
    color: #9ca3af;
}

.no-data-icon {
    font-size: 48px;
    display: block;
    margin-bottom: 12px;
    opacity: 0.5;
}

.table-wrapper {
    overflow-x: auto;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #e5e7eb;
}

th {
    font-weight: 600;
    color: #374151;
    background: #f8fafc;
}

.badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
}

.badge-success {
    background: #d1fae5;
    color: #065f46;
}

.badge-info {
    background: #dbeafe;
    color: #1e40af;
}

.badge-warning {
    background: #fef3c7;
    color: #92400e;
}

.badge-secondary {
    background: #f3f4f6;
    color: #6b7280;
}

.amount {
    font-weight: 600;
}

.amount.positive {
    color: #10b981;
}

.amount.negative {
    color: #ef4444;
}

.description {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #6b7280;
    font-size: 13px;
}

.status-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #9ca3af;
    margin-right: 6px;
}

.status-dot.completed {
    background: #10b981;
}

.status-dot.pending {
    background: #f59e0b;
}

@media (max-width: 768px) {
    .reports-header {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
    }
    
    .filters {
        flex-direction: column;
    }
    
    .filter-group {
        width: 100%;
    }
    
    .filter-group select,
    .filter-group input {
        width: 100%;
    }
}
</style>
