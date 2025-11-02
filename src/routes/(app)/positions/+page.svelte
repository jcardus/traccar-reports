<script>
    import {Button, Spinner, Datepicker} from "flowbite-svelte";
    import {setAlert} from "$lib/store.js";
    let loadingReport = $state(false)
    let start = $state(undefined), end = $state(undefined), selected = $state(undefined), datePicker = $state(undefined)
    const {data} = $props()
    let reportLoaded = $state(false)
    import {t} from '$lib/i18n.js'
    import SelectDevice from "$lib/components/SelectDevice.svelte";
    import {onMount} from "svelte";
    let devices = $derived(data.devices)
    let grid
    import {Tabulator, FormatModule, PageModule, SortModule, DownloadModule, ExportModule} from 'tabulator-tables';
    import * as XLSX from 'xlsx';
    import {FileChartBarSolid} from "flowbite-svelte-icons";
    Tabulator.registerModule([FormatModule, PageModule, SortModule, DownloadModule, ExportModule]);

    function getAttributeColumns(data) {
        // Collect all unique attribute keys from the data
        const attributeKeys = new Set();
        data.forEach(row => {
            if (row.attributes && typeof row.attributes === 'object') {
                Object.keys(row.attributes).forEach(key => attributeKeys.add(key));
            }
        });

        // Create columns for each attribute
        return Array.from(attributeKeys).sort().map(key => ({
            field: 'attributes|'+key,
            title: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize first letter
            formatter: cell => {
                const value = cell.getData()?.attributes?.[key];
                return value !== undefined && value !== null ? value : '';
            }
        }));
    }

    onMount(() => {
        grid = new Tabulator("#grid", {
            dependencies: {XLSX:XLSX},
            columns: [
                {field: 'fixTime', title: 'Fix Time', formatter: cell => new Date(cell.getValue()).toLocaleString(), sorter: 'number'},
                {field: 'serverTime', title: 'Server Time', formatter: cell => new Date(cell.getValue()).toLocaleString(), sorter: 'number'},
                {field: 'protocol', title: 'Protocol'},
                {field: 'valid', title: 'Valid'},
                {field: 'latitude', title: 'Latitude'},
                {field: 'longitude', title: 'Longitude'},
                {field: 'address', title: 'Address'},
                {field: 'speed', title: 'Speed'},
                {field: 'course', title: 'Course'},
            ],
            pagination:"local",
            paginationSize:500,
            paginationSizeSelector:[500, 1000, 10000],
            paginationCounter:"rows",
            locale: true,
            langs: {
                es: {
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
        <div>
            <Button onclick={async () => {
                loadingReport = false
                if (selected && start && end) {
                    loadingReport = true
                    const url = `/api/positions?deviceId=${selected}&from=${new Date(start).toISOString()}&to=${new Date(end).toISOString()}`;
                    const response = await fetch(url)
                    if (response.ok) {
                        const data = await response.json()

                        // Get base columns
                        const baseColumns = [
                            {field: 'fixTime', title: 'Fix Time', formatter: cell => new Date(cell.getValue()).toLocaleString(), sorter: 'number'},
                            {field: 'serverTime', title: 'Server Time', formatter: cell => new Date(cell.getValue()).toLocaleString(), sorter: 'number'},
                            {field: 'protocol', title: 'Protocol'},
                            {field: 'valid', title: 'Valid'},
                            {field: 'latitude', title: 'Latitude'},
                            {field: 'longitude', title: 'Longitude'},
                            {field: 'address', title: 'Address'},
                            {field: 'speed', title: 'Speed'},
                            {field: 'course', title: 'Course'},
                        ];

                        // Add attribute columns dynamically
                        const attributeColumns = getAttributeColumns(data);
                        grid.setColumns([...baseColumns, ...attributeColumns]);

                        grid.setData(data)
                        loadingReport = false
                        reportLoaded = true
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
        <div>
            {#if reportLoaded}
                <Button  color="alternative" onclick={() => grid.download("xlsx", "positions.xlsx")}>
                    <FileChartBarSolid/>Xlsx
                </Button>
            {/if}
        </div>
    </div>

    <div id="grid" class="flex-1" style="visibility:{reportLoaded?'block':'hidden'}; width: 100%;"></div>
</div>

<!--suppress CssUnusedSymbol -->
<style>
    :global(.tabulator) {
        background-color: rgb(249 250 251 / var(--tw-bg-opacity, 1)) !important;
        font-size: 14px !important;
    }
    :global(.tabulator .tabulator-row:hover) {
        background-color:  #FFF5F2;
    }
</style>
