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
    import {Tabulator, FormatModule, PageModule} from 'tabulator-tables';
    Tabulator.registerModule([FormatModule, PageModule]);

    onMount(() => {
        grid = new Tabulator("#grid", {
            columns: [
                {field: 'fixTime', title: 'Fix Time', formatter: cell => new Date(cell.getValue()).toLocaleString()},
                {field: 'serverTime', title: 'Server Time', formatter: cell => new Date(cell.getValue()).toLocaleString()},
                {field: 'protocol', title: 'Protocol'},
                {field: 'valid', title: 'Valid'},
                {field: 'latitude', title: 'Latitude'},
                {field: 'longitude', title: 'Longitude'},
                {field: 'address', title: 'Address'},
                {field: 'speed', title: 'Speed'},
                {field: 'course', title: 'Course'},
                {
                    field: 'attributes',
                    title: 'Attributes',
                    variableHeight:true,
                    formatter:"json",
                    formatterParams: {
                        multiline: false,
                        indent: ' '
                    }
                }
            ],
            pagination:"local",
            paginationSize:500,
            paginationSizeSelector:[500, 1000, 1000],
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

    <div id="grid" class="flex-1" style="visibility:{reportLoaded?'block':'hidden'}; width: 100%;"></div>
</div>
