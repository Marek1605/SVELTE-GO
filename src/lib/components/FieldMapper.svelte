<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { targetFields, transformTypes } from '$lib/stores/feeds';
    import type { FieldMapping, TargetField, TransformType } from '$lib/stores/feeds';

    export let mappings: FieldMapping[] = [];
    export let sourceFields: string[] = [];
    export let sampleData: Record<string, any>[] = [];

    const dispatch = createEventDispatcher();

    let draggedIndex: number | null = null;
    let dropTarget: number | null = null;

    // Group target fields by category
    $: groupedTargetFields = $targetFields.reduce((acc, field) => {
        if (!acc[field.group]) acc[field.group] = [];
        acc[field.group].push(field);
        return acc;
    }, {} as Record<string, TargetField[]>);

    const groupLabels: Record<string, string> = {
        identifiers: 'Identifikátory',
        basic: 'Základné info',
        pricing: 'Ceny',
        inventory: 'Sklad',
        media: 'Obrázky',
        taxonomy: 'Kategórie',
        attributes: 'Atribúty',
        affiliate: 'Affiliate',
        other: 'Ostatné'
    };

    const conditionTypes = [
        { key: 'none', label: 'Žiadna' },
        { key: 'not_empty', label: 'Nie je prázdne' },
        { key: 'equals', label: 'Rovná sa' },
        { key: 'not_equals', label: 'Nerovná sa' },
        { key: 'contains', label: 'Obsahuje' },
        { key: 'not_contains', label: 'Neobsahuje' },
        { key: 'regex', label: 'Regex' },
        { key: 'greater', label: 'Väčšie ako' },
        { key: 'less', label: 'Menšie ako' },
        { key: 'in_list', label: 'Je v zozname' }
    ];

    const conditionActions = [
        { key: 'import', label: 'Importovať' },
        { key: 'skip', label: 'Preskočiť položku' },
        { key: 'default', label: 'Použiť predvolenú hodnotu' }
    ];

    function addMapping() {
        mappings = [...mappings, {
            source_field: '',
            target_field: '',
            transform_type: 'none',
            transform_value: '',
            transform_options: '',
            condition_type: 'none',
            condition_value: '',
            condition_action: 'import',
            field_order: mappings.length,
            is_required: false
        }];
        dispatch('change', mappings);
    }

    function removeMapping(index: number) {
        mappings = mappings.filter((_, i) => i !== index);
        dispatch('change', mappings);
    }

    function updateMapping(index: number, field: keyof FieldMapping, value: any) {
        mappings[index] = { ...mappings[index], [field]: value };
        mappings = [...mappings];
        dispatch('change', mappings);
    }

    function getSampleValue(sourceField: string): string {
        if (!sampleData.length || !sourceField) return '';
        const value = sampleData[0][sourceField];
        if (value === undefined || value === null) return '';
        if (typeof value === 'string') return value.substring(0, 100);
        return JSON.stringify(value).substring(0, 100);
    }

    function getTargetFieldLabel(key: string): string {
        const field = $targetFields.find(f => f.key === key);
        return field?.label || key;
    }

    function getTransformLabel(key: string): string {
        const transform = $transformTypes.find(t => t.key === key);
        return transform?.label || key;
    }

    function needsTransformParam(type: string): boolean {
        const transform = $transformTypes.find(t => t.key === type);
        return transform?.has_param || false;
    }

    // Drag & Drop handlers
    function handleDragStart(e: DragEvent, index: number) {
        draggedIndex = index;
        (e.target as HTMLElement).classList.add('opacity-50');
    }

    function handleDragEnd(e: DragEvent) {
        (e.target as HTMLElement).classList.remove('opacity-50');
        draggedIndex = null;
        dropTarget = null;
    }

    function handleDragOver(e: DragEvent, index: number) {
        e.preventDefault();
        dropTarget = index;
    }

    function handleDrop(e: DragEvent, index: number) {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newMappings = [...mappings];
        const [dragged] = newMappings.splice(draggedIndex, 1);
        newMappings.splice(index, 0, dragged);
        
        // Update order
        mappings = newMappings.map((m, i) => ({ ...m, field_order: i }));
        dispatch('change', mappings);
        
        draggedIndex = null;
        dropTarget = null;
    }

    // Auto-add unmapped required fields
    function addRequiredFields() {
        const required = $targetFields.filter(f => f.required);
        const mapped = new Set(mappings.map(m => m.target_field));
        
        const newMappings = required
            .filter(f => !mapped.has(f.key))
            .map((f, i) => ({
                source_field: '',
                target_field: f.key,
                transform_type: 'none',
                transform_value: '',
                transform_options: '',
                condition_type: 'none',
                condition_value: '',
                condition_action: 'import',
                field_order: mappings.length + i,
                is_required: true
            }));
        
        if (newMappings.length > 0) {
            mappings = [...mappings, ...newMappings];
            dispatch('change', mappings);
        }
    }

    // Apply auto-mappings
    export function applyAutoMappings(autoMappings: { source_field: string; target_field: string }[]) {
        const newMappings = autoMappings.map((m, i) => ({
            source_field: m.source_field,
            target_field: m.target_field,
            transform_type: 'none',
            transform_value: '',
            transform_options: '',
            condition_type: 'none',
            condition_value: '',
            condition_action: 'import',
            field_order: i,
            is_required: false
        }));
        
        mappings = newMappings;
        dispatch('change', mappings);
    }
</script>

<div class="space-y-4">
    <!-- Header -->
    <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold text-gray-900">Mapovanie polí</h3>
        <div class="flex gap-2">
            <button
                on:click={addRequiredFields}
                class="px-3 py-1.5 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
            >
                + Povinné polia
            </button>
            <button
                on:click={addMapping}
                class="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition"
            >
                + Pridať mapovanie
            </button>
        </div>
    </div>

    <!-- Mappings list -->
    {#if mappings.length === 0}
        <div class="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
            <div class="text-gray-500 mb-4">Žiadne mapovanie polí</div>
            <button
                on:click={addMapping}
                class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
                Pridať prvé mapovanie
            </button>
        </div>
    {:else}
        <div class="space-y-3">
            {#each mappings as mapping, index (index)}
                <div
                    class="bg-white border border-gray-200 rounded-xl p-4 transition-all {dropTarget === index ? 'border-indigo-400 bg-indigo-50' : ''}"
                    draggable="true"
                    on:dragstart={(e) => handleDragStart(e, index)}
                    on:dragend={handleDragEnd}
                    on:dragover={(e) => handleDragOver(e, index)}
                    on:drop={(e) => handleDrop(e, index)}
                >
                    <!-- Main row -->
                    <div class="flex items-start gap-4">
                        <!-- Drag handle -->
                        <div class="cursor-move text-gray-400 hover:text-gray-600 pt-2">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm8-12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
                            </svg>
                        </div>

                        <!-- Source field -->
                        <div class="flex-1">
                            <label class="block text-xs font-medium text-gray-500 mb-1">Zdrojové pole</label>
                            <select
                                value={mapping.source_field}
                                on:change={(e) => updateMapping(index, 'source_field', e.currentTarget.value)}
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">-- Vyberte pole --</option>
                                {#each sourceFields as field}
                                    <option value={field}>{field}</option>
                                {/each}
                            </select>
                            {#if mapping.source_field}
                                <div class="text-xs text-gray-400 mt-1 truncate" title={getSampleValue(mapping.source_field)}>
                                    Ukážka: {getSampleValue(mapping.source_field) || '(prázdne)'}
                                </div>
                            {/if}
                        </div>

                        <!-- Arrow -->
                        <div class="text-gray-400 pt-8">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                            </svg>
                        </div>

                        <!-- Target field -->
                        <div class="flex-1">
                            <label class="block text-xs font-medium text-gray-500 mb-1">Cieľové pole</label>
                            <select
                                value={mapping.target_field}
                                on:change={(e) => updateMapping(index, 'target_field', e.currentTarget.value)}
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">-- Vyberte pole --</option>
                                {#each Object.entries(groupedTargetFields) as [group, fields]}
                                    <optgroup label={groupLabels[group] || group}>
                                        {#each fields as field}
                                            <option value={field.key}>
                                                {field.label} {field.required ? '*' : ''}
                                            </option>
                                        {/each}
                                    </optgroup>
                                {/each}
                            </select>
                        </div>

                        <!-- Transform -->
                        <div class="w-40">
                            <label class="block text-xs font-medium text-gray-500 mb-1">Transformácia</label>
                            <select
                                value={mapping.transform_type}
                                on:change={(e) => updateMapping(index, 'transform_type', e.currentTarget.value)}
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                {#each $transformTypes as transform}
                                    <option value={transform.key}>{transform.label}</option>
                                {/each}
                            </select>
                        </div>

                        <!-- Delete button -->
                        <button
                            on:click={() => removeMapping(index)}
                            class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition mt-6"
                            title="Odstrániť"
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </button>
                    </div>

                    <!-- Extended options -->
                    {#if needsTransformParam(mapping.transform_type) || mapping.condition_type !== 'none'}
                        <div class="mt-4 pt-4 border-t border-gray-100 flex gap-4">
                            {#if needsTransformParam(mapping.transform_type)}
                                <div class="flex-1">
                                    <label class="block text-xs font-medium text-gray-500 mb-1">
                                        Transformačný parameter
                                    </label>
                                    <input
                                        type="text"
                                        value={mapping.transform_value}
                                        on:input={(e) => updateMapping(index, 'transform_value', e.currentTarget.value)}
                                        placeholder="Hodnota pre transformáciu"
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            {/if}
                        </div>
                    {/if}

                    <!-- Condition row -->
                    <div class="mt-4 pt-4 border-t border-gray-100">
                        <details class="group">
                            <summary class="flex items-center gap-2 cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                                <svg class="w-4 h-4 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                                </svg>
                                Podmienky
                                {#if mapping.condition_type !== 'none'}
                                    <span class="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs">Aktívna</span>
                                {/if}
                            </summary>
                            <div class="mt-3 flex gap-4">
                                <div class="w-40">
                                    <label class="block text-xs font-medium text-gray-500 mb-1">Typ podmienky</label>
                                    <select
                                        value={mapping.condition_type}
                                        on:change={(e) => updateMapping(index, 'condition_type', e.currentTarget.value)}
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        {#each conditionTypes as cond}
                                            <option value={cond.key}>{cond.label}</option>
                                        {/each}
                                    </select>
                                </div>
                                {#if mapping.condition_type !== 'none' && mapping.condition_type !== 'not_empty'}
                                    <div class="flex-1">
                                        <label class="block text-xs font-medium text-gray-500 mb-1">Hodnota</label>
                                        <input
                                            type="text"
                                            value={mapping.condition_value}
                                            on:input={(e) => updateMapping(index, 'condition_value', e.currentTarget.value)}
                                            placeholder="Hodnota pre porovnanie"
                                            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                {/if}
                                {#if mapping.condition_type !== 'none'}
                                    <div class="w-48">
                                        <label class="block text-xs font-medium text-gray-500 mb-1">Akcia</label>
                                        <select
                                            value={mapping.condition_action}
                                            on:change={(e) => updateMapping(index, 'condition_action', e.currentTarget.value)}
                                            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            {#each conditionActions as action}
                                                <option value={action.key}>{action.label}</option>
                                            {/each}
                                        </select>
                                    </div>
                                {/if}
                            </div>
                        </details>
                    </div>
                </div>
            {/each}
        </div>
    {/if}

    <!-- Legend -->
    <div class="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 class="text-sm font-medium text-gray-700 mb-2">Transformácie</h4>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
            {#each $transformTypes.slice(0, 8) as transform}
                <div>
                    <span class="font-medium">{transform.label}:</span>
                    <span class="text-gray-500">{transform.description}</span>
                </div>
            {/each}
        </div>
    </div>
</div>
