<script lang="ts">
    import { createEventDispatcher, onDestroy } from 'svelte';
    import type { ImportProgress, LogEntry } from '$lib/stores/feeds';
    import { formatDuration, getLogLevelColor } from '$lib/feedApi';

    export let progress: ImportProgress;
    export let feedName: string = '';

    const dispatch = createEventDispatcher();

    let showLogs = false;
    let autoScroll = true;
    let logsContainer: HTMLElement;

    $: if (progress && autoScroll && logsContainer) {
        setTimeout(() => {
            logsContainer.scrollTop = logsContainer.scrollHeight;
        }, 100);
    }

    function handleStop() {
        dispatch('stop');
    }

    function getStatusText(status: string): string {
        const texts: Record<string, string> = {
            idle: 'Pripravený',
            running: 'Beží...',
            completed: 'Dokončený',
            failed: 'Zlyhanie',
            cancelled: 'Zrušený'
        };
        return texts[status] || status;
    }

    function getStatusIcon(status: string): string {
        const icons: Record<string, string> = {
            idle: '⏸️',
            running: '🔄',
            completed: '✅',
            failed: '❌',
            cancelled: '⏹️'
        };
        return icons[status] || '❓';
    }

    function formatTime(date: string): string {
        return new Date(date).toLocaleTimeString('sk-SK');
    }
</script>

<div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <!-- Header -->
    <div class="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <div class="flex justify-between items-center">
            <div>
                <h3 class="text-lg font-semibold">Import Progress</h3>
                {#if feedName}
                    <p class="text-indigo-100 text-sm">{feedName}</p>
                {/if}
            </div>
            <div class="text-right">
                <div class="text-3xl font-bold">{progress.percent}%</div>
                <div class="text-indigo-100 text-sm">{getStatusText(progress.status)}</div>
            </div>
        </div>
    </div>

    <!-- Progress bar -->
    <div class="h-2 bg-gray-200">
        <div 
            class="h-full transition-all duration-300 ease-out
                   {progress.status === 'running' ? 'bg-indigo-600' : 
                    progress.status === 'completed' ? 'bg-green-500' : 
                    progress.status === 'failed' ? 'bg-red-500' : 'bg-gray-400'}"
            style="width: {progress.percent}%"
        ></div>
    </div>

    <!-- Stats -->
    <div class="p-6">
        <!-- Current message -->
        {#if progress.message}
            <div class="mb-4 px-4 py-2 bg-gray-50 rounded-lg text-sm text-gray-700">
                {progress.message}
            </div>
        {/if}

        <!-- Stats grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <div class="text-center p-3 bg-blue-50 rounded-lg">
                <div class="text-2xl font-bold text-blue-600">{progress.processed.toLocaleString()}</div>
                <div class="text-xs text-blue-600">Spracovaných</div>
            </div>
            <div class="text-center p-3 bg-gray-50 rounded-lg">
                <div class="text-2xl font-bold text-gray-600">{progress.total.toLocaleString()}</div>
                <div class="text-xs text-gray-600">Celkom</div>
            </div>
            <div class="text-center p-3 bg-green-50 rounded-lg">
                <div class="text-2xl font-bold text-green-600">{progress.created.toLocaleString()}</div>
                <div class="text-xs text-green-600">Vytvorených</div>
            </div>
            <div class="text-center p-3 bg-yellow-50 rounded-lg">
                <div class="text-2xl font-bold text-yellow-600">{progress.updated.toLocaleString()}</div>
                <div class="text-xs text-yellow-600">Aktualizovaných</div>
            </div>
            <div class="text-center p-3 bg-gray-50 rounded-lg">
                <div class="text-2xl font-bold text-gray-600">{progress.skipped.toLocaleString()}</div>
                <div class="text-xs text-gray-600">Preskočených</div>
            </div>
            <div class="text-center p-3 bg-red-50 rounded-lg">
                <div class="text-2xl font-bold text-red-600">{progress.errors}</div>
                <div class="text-xs text-red-600">Chýb</div>
            </div>
        </div>

        <!-- Time stats -->
        <div class="flex justify-between items-center text-sm text-gray-600 mb-6">
            <div>
                <span class="font-medium">Uplynulý čas:</span> 
                {formatDuration(progress.elapsed)}
            </div>
            {#if progress.status === 'running' && progress.eta > 0}
                <div>
                    <span class="font-medium">Zostáva:</span> 
                    ~{formatDuration(progress.eta)}
                </div>
            {/if}
            {#if progress.speed > 0}
                <div>
                    <span class="font-medium">Rýchlosť:</span> 
                    {progress.speed.toFixed(1)} položiek/s
                </div>
            {/if}
        </div>

        <!-- Actions -->
        <div class="flex justify-between items-center">
            <button
                on:click={() => showLogs = !showLogs}
                class="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
                <svg class="w-4 h-4 transition-transform {showLogs ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
                {showLogs ? 'Skryť logy' : 'Zobraziť logy'} ({progress.logs?.length || 0})
            </button>

            {#if progress.status === 'running'}
                <button
                    on:click={handleStop}
                    class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/>
                    </svg>
                    Zastaviť
                </button>
            {/if}
        </div>

        <!-- Logs -->
        {#if showLogs && progress.logs?.length > 0}
            <div class="mt-4 border-t border-gray-200 pt-4">
                <div class="flex justify-between items-center mb-2">
                    <h4 class="text-sm font-medium text-gray-700">Import Logy</h4>
                    <label class="flex items-center gap-2 text-sm text-gray-600">
                        <input type="checkbox" bind:checked={autoScroll} class="rounded" />
                        Auto-scroll
                    </label>
                </div>
                <div 
                    bind:this={logsContainer}
                    class="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto font-mono text-xs"
                >
                    {#each progress.logs as log}
                        <div class="flex gap-2 py-0.5">
                            <span class="text-gray-500 flex-shrink-0">
                                {formatTime(log.time)}
                            </span>
                            <span class="{getLogLevelColor(log.level)} uppercase w-16 flex-shrink-0">
                                [{log.level}]
                            </span>
                            <span class="text-gray-300 break-all">
                                {log.message}
                            </span>
                        </div>
                    {/each}
                </div>
            </div>
        {/if}
    </div>
</div>
