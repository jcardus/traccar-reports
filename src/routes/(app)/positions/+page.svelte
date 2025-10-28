<script>
    import {Button, Toolbar, Spinner, Datepicker} from "flowbite-svelte";
    import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
    import {setAlert} from "$lib/store.js";
    import { createGrid } from 'ag-grid-community';
    ModuleRegistry.registerModules([AllCommunityModule]);
    let loadingReport = $state(false)
    let start = $state(undefined), end = $state(undefined), selected = $state(undefined), datePicker = $state(undefined)
    const {data} = $props()
    let reportLoaded = $state(false)
    import {t} from '$lib/i18n.js'
    import SelectDevice from "$lib/components/SelectDevice.svelte";
    import {onMount} from "svelte";
    let devices = $derived(data.devices)
    let gridDiv
    let grid

    onMount(() => {
        grid = createGrid(gridDiv, {
            pagination: true,
            columnDefs: [
                {field: 'fixTime', valueFormatter: params => new Date(params.value).toLocaleString()},
                {field: 'serverTime', valueFormatter: params => new Date(params.value).toLocaleString()},
                {field: 'protocol'},
                {field: 'valid'},
                {field: 'latitude'},
                {field: 'longitude'},
                {field: 'address'},
                {field: 'speed'},
                {field: 'course'},
                {field: 'attributes', valueFormatter: params => JSON.stringify(params.value)},
            ]
        });
    })

</script>

<div class="flex flex-col h-full">
    <Toolbar >
        <div class="flex gap-4">
            <SelectDevice devices={devices} bind:selected="{selected}"/>
        </div>
        <div class="p-4 w-96">
            <Datepicker locale={navigator.language} range bind:rangeFrom={start} bind:rangeTo={end} bind:datePicker="{datePicker}"></Datepicker>
        </div>
        <div class="p-4">
            <Button onclick={async () => {
                loadingReport = false
                if (selected && start && end) {
                    loadingReport = true
                    grid.setGridOption('rowData', null)
                    const url = `/api/positions?deviceId=${selected}&from=${new Date(start).toISOString()}&to=${new Date(end).toISOString()}`;
                    const response = await fetch(url)
                    if (response.ok) {
                        loadingReport = false
                        reportLoaded = true
                        grid.setGridOption('rowData', await response.json())
                    }
                } else {
                    setAlert('Please select devices and dates')
                }
            }}>
                {#if loadingReport}
                    <Spinner class="me-3" size="4" color="white"/>
                {/if}
                {loadingReport?t('Carregando...'):t('Gerar')}
            </Button>
        </div>
    </Toolbar>
    <div bind:this={gridDiv} class="ag-theme-alpine-dark flex-1" style="visibility:{reportLoaded?'block':'hidden'}; width: 100%;"></div>
</div>
