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
    import {TabulatorFull as Tabulator} from 'tabulator-tables';


    onMount(() => {
        grid = new Tabulator("#grid", {
            layout:"fitColumns", //fit columns to width of table (optional)
            // autoColumns:true,
            columns: [
                {field: 'fixTime', valueFormatter: params => new Date(params.value).toLocaleString(), title: 'Fix Time', formatter: 'datetime'},
                {field: 'serverTime', valueFormatter: params => new Date(params.value).toLocaleString()},
                {field: 'protocol'},
                {field: 'valid'},
                {field: 'latitude'},
                {field: 'longitude'},
                {field: 'address'},
                {field: 'speed'},
                {field: 'course'},
                {field: 'attributes', valueFormatter: params => JSON.stringify(params.value)},
            ],
            pagination:"local",
            paginationSize:500,
            paginationSizeSelector:[500, 1000, 1000],
            paginationCounter:"rows",
            locale: true,
            langs: {
                pt: {
                    pagination: {
                        all: "All",
                        counter: {
                            of: "de",
                            pages: "pages",
                            rows: "registos",
                            showing: "Mostrando",
                        },
                        first: "First", //text for the first page button
                        first_title: "First Page", //tooltip text for the first page button
                        last: "Last",
                        last_title: "Last Page",
                        next: "Next",
                        next_title: "Next Page",
                        page_size: "Page Size",
                        page_title: "Show Page",
                        prev: "Prev",
                        prev_title: "Prev Page"
                    },
                },
            },
        });
    })

</script>

<div class="flex flex-col h-full">
    <div class="flex gap-4 items-center">
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
                    // grid.setGridOption('rowData', null)
                    const url = `/api/positions?deviceId=${selected}&from=${new Date(start).toISOString()}&to=${new Date(end).toISOString()}`;
                    const response = await fetch(url)
                    if (response.ok) {
                        loadingReport = false
                        reportLoaded = true
                        grid.setData(await response.json())
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
    </div>

    <div bind:this={gridDiv} id="grid" class="flex-1" style="visibility:{reportLoaded?'block':'hidden'}; width: 100%;"></div>
</div>
