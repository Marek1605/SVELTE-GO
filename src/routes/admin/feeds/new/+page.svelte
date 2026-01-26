<script lang="ts">
    import { goto } from '$app/navigation';
    import { onMount } from 'svelte';
    import { feedPreview, previewLoading, targetFields, transformTypes } from '$lib/stores/feeds';
    import { previewFeed, createFeed, loadMetadata, saveFieldMappings } from '$lib/feedApi';
    import FieldMapper from '$lib/components/FieldMapper.svelte';
    import type { FieldMapping } from '$lib/stores/feeds';

    // Form data
    let name = '';
    let description = '';
    let feedUrl = '';
    let feedType = '';
    let xmlItemPath = 'SHOPITEM';
    let csvDelimiter = ';';
    let csvHasHeader = true;
    let importMode = 'create_update';
    let matchBy = 'ean';
    let importImages = true;
    let createAttributes = true;
    let scheduleEnabled = false;
    let scheduleFrequency = 'daily';
    let scheduleTime = '03:00';

    // State
    let step = 1;
    let loading = false;
    let error = '';
    let mappings: FieldMapping[] = [];
    let fieldMapperComponent: FieldMapper;

    onMount(() => {
        loadMetadata();
    });

    async function handlePreview() {
        if (!feedUrl) {
            error = 'Zadajte URL feedu';
            return;
        }

        error = '';
        try {
            const preview = await previewFeed(feedUrl, feedType, xmlItemPath);
            
            if (preview) {
                // Auto-detect settings from preview
                if (!feedType && preview.feed_type) {
                    feedType = preview.feed_type;
                }
                if (preview.item_path) {
                    xmlItemPath = preview.item_path;
                }
                
                // Apply auto-mappings
                if (preview.auto_mappings && fieldMapperComponent) {
                    fieldMapperComponent.applyAutoMappings(preview.auto_mappings);
                }
                
                step = 2;
            }
        } catch (e: any) {
            error = e.message || 'Nepodarilo sa načítať feed';
        }
    }

    async function handleCreate() {
        if (!name) {
            error = 'Zadajte názov feedu';
            return;
        }

        loading = true;
        error = '';

        try {
            const feed = await createFeed({
                name,
                description,
                feed_url: feedUrl,
                feed_type: feedType as any,
                xml_item_path: xmlItemPath,
                csv_delimiter: csvDelimiter,
                csv_has_header: csvHasHeader,
                import_mode: importMode as any,
                match_by: matchBy as any,
                import_images: importImages,
                create_attributes: createAttributes,
                schedule_enabled: scheduleEnabled,
                schedule_frequency: scheduleFrequency,
                schedule_time: scheduleTime,
                active: true,
                field_mappings: mappings
            });

            if (feed) {
                goto(`/admin/feeds/${feed.id}`);
            }
        } catch (e: any) {
            error = e.message || 'Nepodarilo sa vytvoriť feed';
        } finally {
            loading = false;
        }
    }

    function handleMappingsChange(e: CustomEvent<FieldMapping[]>) {
        mappings = e.detail;
    }
</script>

<svelte:head>
    <title>Nový feed - Feed Importer</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-5xl">
    <!-- Header -->
    <div class="mb-8">
        <a href="/admin/feeds" class="text-indigo-600 hover:text-indigo-800 text-sm mb-2 inline-flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Späť na zoznam
        </a>
        <h1 class="text-3xl font-bold text-gray-900">Nový feed</h1>
    </div>

    <!-- Steps -->
    <div class="flex items-center mb-8">
        {#each [1, 2, 3] as s}
            <div class="flex items-center">
                <div class="w-10 h-10 rounded-full flex items-center justify-center font-medium
                           {step >= s ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}">
                    {s}
                </div>
                {#if s < 3}
                    <div class="w-16 h-1 mx-2 {step > s ? 'bg-indigo-600' : 'bg-gray-200'}"></div>
                {/if}
            </div>
        {/each}
        <div class="ml-4 text-sm text-gray-600">
            {#if step === 1}
                Načítanie feedu
            {:else if step === 2}
                Mapovanie polí
            {:else}
                Nastavenia
            {/if}
        </div>
    </div>

    <!-- Error -->
    {#if error}
        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
        </div>
    {/if}

    <!-- Step 1: URL & Preview -->
    {#if step === 1}
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">1. Zadajte URL feedu</h2>
            
            <div class="space-y-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">URL feedu *</label>
                    <input
                        type="url"
                        bind:value={feedUrl}
                        placeholder="https://example.com/feed.xml"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                <div class="grid grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Typ feedu</label>
                        <select
                            bind:value={feedType}
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">Auto-detect</option>
                            <option value="xml">XML</option>
                            <option value="csv">CSV</option>
                            <option value="json">JSON</option>
                        </select>
                    </div>

                    {#if feedType === 'xml' || !feedType}
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">XML Item Path</label>
                            <input
                                type="text"
                                bind:value={xmlItemPath}
                                placeholder="SHOPITEM"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    {/if}

                    {#if feedType === 'csv'}
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">CSV Oddeľovač</label>
                            <select
                                bind:value={csvDelimiter}
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value=";">Bodkočiarka (;)</option>
                                <option value=",">Čiarka (,)</option>
                                <option value="\t">Tab</option>
                                <option value="|">Pipe (|)</option>
                            </select>
                        </div>
                    {/if}
                </div>

                <div class="flex justify-end">
                    <button
                        on:click={handlePreview}
                        disabled={$previewLoading || !feedUrl}
                        class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {#if $previewLoading}
                            <div class="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                            Načítavam...
                        {:else}
                            Načítať a pokračovať
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                            </svg>
                        {/if}
                    </button>
                </div>
            </div>
        </div>
    {/if}

    <!-- Step 2: Field Mapping -->
    {#if step === 2 && $feedPreview}
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">2. Mapovanie polí</h2>
            
            <!-- Preview info -->
            <div class="bg-gray-50 rounded-lg p-4 mb-6">
                <div class="grid grid-cols-4 gap-4 text-sm">
                    <div>
                        <span class="text-gray-500">Typ:</span>
                        <span class="font-medium ml-1 uppercase">{$feedPreview.feed_type}</span>
                    </div>
                    <div>
                        <span class="text-gray-500">Item path:</span>
                        <span class="font-medium ml-1">{$feedPreview.item_path}</span>
                    </div>
                    <div>
                        <span class="text-gray-500">Položiek:</span>
                        <span class="font-medium ml-1">{$feedPreview.total_items}+</span>
                    </div>
                    <div>
                        <span class="text-gray-500">Polí:</span>
                        <span class="font-medium ml-1">{$feedPreview.fields.length}</span>
                    </div>
                </div>
            </div>

            <!-- Sample data -->
            {#if $feedPreview.sample_items.length > 0}
                <details class="mb-6">
                    <summary class="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                        Zobraziť ukážku dát ({$feedPreview.sample_items.length} položiek)
                    </summary>
                    <div class="mt-2 overflow-x-auto">
                        <pre class="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">{JSON.stringify($feedPreview.sample_items[0], null, 2)}</pre>
                    </div>
                </details>
            {/if}

            <!-- Field Mapper -->
            <FieldMapper
                bind:this={fieldMapperComponent}
                bind:mappings
                sourceFields={$feedPreview.fields}
                sampleData={$feedPreview.sample_items}
                on:change={handleMappingsChange}
            />

            <div class="flex justify-between mt-6 pt-6 border-t border-gray-200">
                <button
                    on:click={() => step = 1}
                    class="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                    ← Späť
                </button>
                <button
                    on:click={() => step = 3}
                    class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                    Pokračovať →
                </button>
            </div>
        </div>
    {/if}

    <!-- Step 3: Settings -->
    {#if step === 3}
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">3. Nastavenia feedu</h2>

            <div class="space-y-6">
                <!-- Basic info -->
                <div class="grid grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Názov feedu *</label>
                        <input
                            type="text"
                            bind:value={name}
                            placeholder="Môj feed"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Popis</label>
                        <input
                            type="text"
                            bind:value={description}
                            placeholder="Voliteľný popis"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>

                <!-- Import settings -->
                <div class="grid grid-cols-2 gap-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Import mód</label>
                        <select
                            bind:value={importMode}
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="create_update">Vytvárať a aktualizovať</option>
                            <option value="create_only">Len vytvárať nové</option>
                            <option value="update_only">Len aktualizovať existujúce</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Párovanie podľa</label>
                        <select
                            bind:value={matchBy}
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="ean">EAN / GTIN</option>
                            <option value="sku">SKU</option>
                            <option value="external_id">Externé ID</option>
                            <option value="title">Názov</option>
                        </select>
                    </div>
                </div>

                <!-- Options -->
                <div class="grid grid-cols-2 gap-6">
                    <label class="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" bind:checked={importImages} class="w-5 h-5 rounded text-indigo-600" />
                        <span class="text-gray-700">Importovať obrázky</span>
                    </label>
                    <label class="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" bind:checked={createAttributes} class="w-5 h-5 rounded text-indigo-600" />
                        <span class="text-gray-700">Vytvárať atribúty</span>
                    </label>
                </div>

                <!-- Schedule -->
                <div class="p-4 bg-gray-50 rounded-lg">
                    <label class="flex items-center gap-3 cursor-pointer mb-4">
                        <input type="checkbox" bind:checked={scheduleEnabled} class="w-5 h-5 rounded text-indigo-600" />
                        <span class="font-medium text-gray-700">Automatický import</span>
                    </label>

                    {#if scheduleEnabled}
                        <div class="grid grid-cols-2 gap-4 mt-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Frekvencia</label>
                                <select
                                    bind:value={scheduleFrequency}
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="hourly">Každú hodinu</option>
                                    <option value="twice_daily">2x denne</option>
                                    <option value="daily">Denne</option>
                                    <option value="weekly">Týždenne</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">Čas</label>
                                <input
                                    type="time"
                                    bind:value={scheduleTime}
                                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>
                    {/if}
                </div>

                <!-- Actions -->
                <div class="flex justify-between pt-6 border-t border-gray-200">
                    <button
                        on:click={() => step = 2}
                        class="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    >
                        ← Späť
                    </button>
                    <button
                        on:click={handleCreate}
                        disabled={loading || !name}
                        class="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {#if loading}
                            <div class="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                            Vytváram...
                        {:else}
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            Vytvoriť feed
                        {/if}
                    </button>
                </div>
            </div>
        </div>
    {/if}
</div>
