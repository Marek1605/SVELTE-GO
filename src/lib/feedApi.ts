import { 
    feeds, feedsLoading, feedsError, currentFeed, 
    feedPreview, previewLoading, importProgress,
    targetFields, transformTypes
} from './stores/feeds';
import type { Feed, FieldMapping, ImportProgress, FeedPreview } from './stores/feeds';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// API BASE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            return {
                success: false,
                error: data?.error || `HTTP ${response.status}`,
            };
        }

        return data;
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Network error',
        };
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FEEDS CRUD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function loadFeeds(): Promise<void> {
    feedsLoading.set(true);
    feedsError.set(null);

    const response = await fetchApi<Feed[]>('/feeds');

    if (response.success && response.data) {
        feeds.set(response.data);
    } else {
        feedsError.set(response.error || 'Failed to load feeds');
    }

    feedsLoading.set(false);
}

export async function loadFeed(id: string): Promise<Feed | null> {
    const response = await fetchApi<Feed>(`/feeds/${id}`);

    if (response.success && response.data) {
        currentFeed.set(response.data);
        return response.data;
    }

    return null;
}

export async function createFeed(data: Partial<Feed>): Promise<Feed | null> {
    const response = await fetchApi<Feed>('/feeds', {
        method: 'POST',
        body: JSON.stringify(data),
    });

    if (response.success && response.data) {
        feeds.update(list => [...list, response.data!]);
        return response.data;
    }

    throw new Error(response.error || 'Failed to create feed');
}

export async function updateFeed(id: string, data: Partial<Feed>): Promise<Feed | null> {
    const response = await fetchApi<Feed>(`/feeds/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });

    if (response.success && response.data) {
        feeds.update(list => 
            list.map(f => f.id === id ? response.data! : f)
        );
        currentFeed.set(response.data);
        return response.data;
    }

    throw new Error(response.error || 'Failed to update feed');
}

export async function deleteFeed(id: string): Promise<boolean> {
    const response = await fetchApi(`/feeds/${id}`, {
        method: 'DELETE',
    });

    if (response.success) {
        feeds.update(list => list.filter(f => f.id !== id));
        return true;
    }

    throw new Error(response.error || 'Failed to delete feed');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PREVIEW & MAPPING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function previewFeed(url: string, type?: string, xmlItemPath?: string): Promise<FeedPreview | null> {
    previewLoading.set(true);
    feedPreview.set(null);

    const response = await fetchApi<FeedPreview>('/feeds/preview', {
        method: 'POST',
        body: JSON.stringify({
            url,
            type: type || '',
            xml_item_path: xmlItemPath || '',
        }),
    });

    previewLoading.set(false);

    if (response.success && response.data) {
        feedPreview.set(response.data);
        return response.data;
    }

    throw new Error(response.error || 'Failed to preview feed');
}

export async function getFieldMappings(feedId: string): Promise<FieldMapping[]> {
    const response = await fetchApi<FieldMapping[]>(`/feeds/${feedId}/mapping`);
    return response.data || [];
}

export async function saveFieldMappings(feedId: string, mappings: FieldMapping[]): Promise<boolean> {
    const response = await fetchApi(`/feeds/${feedId}/mapping`, {
        method: 'PUT',
        body: JSON.stringify(mappings),
    });

    if (response.success) {
        currentFeed.update(feed => {
            if (feed && feed.id === feedId) {
                return { ...feed, field_mappings: mappings };
            }
            return feed;
        });
        return true;
    }

    throw new Error(response.error || 'Failed to save mappings');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// IMPORT CONTROL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function startImport(feedId: string): Promise<ImportProgress | null> {
    const response = await fetchApi<ImportProgress>(`/feeds/${feedId}/import`, {
        method: 'POST',
    });

    if (response.success && response.data) {
        importProgress.update(progress => ({
            ...progress,
            [feedId]: response.data!,
        }));
        return response.data;
    }

    throw new Error(response.error || 'Failed to start import');
}

export async function stopImport(feedId: string): Promise<boolean> {
    const response = await fetchApi(`/feeds/${feedId}/stop`, {
        method: 'POST',
    });

    return response.success;
}

export async function getProgress(feedId: string): Promise<ImportProgress | null> {
    const response = await fetchApi<ImportProgress>(`/feeds/${feedId}/progress`);

    if (response.success && response.data) {
        importProgress.update(progress => ({
            ...progress,
            [feedId]: response.data!,
        }));
        return response.data;
    }

    return null;
}

// Progress polling
let progressIntervals: Record<string, number> = {};

export function startProgressPolling(feedId: string, intervalMs = 1000): void {
    if (progressIntervals[feedId]) {
        return;
    }

    progressIntervals[feedId] = window.setInterval(async () => {
        const progress = await getProgress(feedId);
        
        if (progress && (progress.status === 'completed' || progress.status === 'failed' || progress.status === 'cancelled')) {
            stopProgressPolling(feedId);
            // Reload feeds to get updated stats
            loadFeeds();
        }
    }, intervalMs);
}

export function stopProgressPolling(feedId: string): void {
    if (progressIntervals[feedId]) {
        clearInterval(progressIntervals[feedId]);
        delete progressIntervals[feedId];
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HISTORY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ImportHistoryEntry {
    id: string;
    feed_id: string;
    started_at: string;
    finished_at: string | null;
    duration: number;
    total_items: number;
    processed: number;
    created: number;
    updated: number;
    skipped: number;
    errors: number;
    images_processed: number;
    status: string;
    error_message: string | null;
    triggered_by: string;
}

export async function getImportHistory(feedId: string, limit = 20, offset = 0): Promise<ImportHistoryEntry[]> {
    const response = await fetchApi<ImportHistoryEntry[]>(
        `/feeds/${feedId}/history?limit=${limit}&offset=${offset}`
    );
    return response.data || [];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// METADATA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export async function loadTargetFields(): Promise<void> {
    const response = await fetchApi('/feeds/meta/target-fields');
    if (response.success && response.data) {
        targetFields.set(response.data);
    }
}

export async function loadTransformTypes(): Promise<void> {
    const response = await fetchApi('/feeds/meta/transforms');
    if (response.success && response.data) {
        transformTypes.set(response.data);
    }
}

export async function loadMetadata(): Promise<void> {
    await Promise.all([
        loadTargetFields(),
        loadTransformTypes(),
    ]);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function formatDuration(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

export function formatDate(dateString: string | null): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('sk-SK');
}

export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        active: 'text-green-600 bg-green-100',
        running: 'text-blue-600 bg-blue-100',
        paused: 'text-yellow-600 bg-yellow-100',
        error: 'text-red-600 bg-red-100',
        completed: 'text-green-600 bg-green-100',
        failed: 'text-red-600 bg-red-100',
        idle: 'text-gray-600 bg-gray-100',
    };
    return colors[status] || colors.idle;
}

export function getLogLevelColor(level: string): string {
    const colors: Record<string, string> = {
        debug: 'text-gray-500',
        info: 'text-blue-600',
        warning: 'text-yellow-600',
        error: 'text-red-600',
        critical: 'text-red-700 font-bold',
    };
    return colors[level] || colors.info;
}
