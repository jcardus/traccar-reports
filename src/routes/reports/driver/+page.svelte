<script>
    import {
        Button,
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow, Spinner,
        TableHead, Progressbar,
        TableHeadCell, Toolbar
    } from "flowbite-svelte";
    import { t, locale } from "$lib/i18n";
    import {ExpandOutline, FileChartBarSolid, FilePdfSolid, MinimizeOutline} from "flowbite-svelte-icons";
    import XlsxWorker from '$lib/workers/trips/worker.js?worker';
    import {columns, getColumnValue} from '$lib/workers/trips/model';

    const { data } = $props();
    const {drivers, groups} = data
    let showExport = $state(true)
    let tbl
    let maximized = $state(false)

    import {onMount} from "svelte";
    let progress = $state(0)
    let deviceCount = 20
    const selected = new URLSearchParams(window.location.search).get('selected')
    const devices = data.devices
    let _devices = $state(devices.slice(0, deviceCount))
    let labelOutside = $state('')
    let generatingXls = $state(false)

    const promises = {}
    const tripsByDevice = {}
    function getTrips(deviceId) {
        if (!promises[deviceId]) {
            const params = new URLSearchParams(window.location.search)
            const newParams = new URLSearchParams({
                deviceId,
                from: params.get('from'),
                to: params.get('to')
            })
            promises[deviceId] = fetch('/api/reports/trips?' + newParams,
                {headers: {accept: 'application/json'}}).then(r => r.json()).then(r => tripsByDevice[deviceId] = r.filter(t => t.driverUniqueId === selected ))
        }
        return promises[deviceId]
    }
    let handleScroll;
    onMount(async () => {
        let i = 1
        await Promise.all(devices.map(d => getTrips(d.id).then(() => {
            progress = Math.round(i++ / devices.length * 100)
            labelOutside = d.name
        })))
        handleScroll = () => {
            if (tbl.scrollTop + tbl.clientHeight >= tbl.scrollHeight && deviceCount < devices.length) {
                deviceCount += 10
                _devices = devices.slice(0, deviceCount)
            }
        }
        tbl?.addEventListener("scroll", handleScroll);
        return () => tbl?.removeEventListener("scroll", handleScroll);
    })

</script>

<svelte:head>
    <title>{t('Driver report').replace(/\s+/g, '-')}</title>that
</svelte:head>

<svelte:window on:afterprint={() => showExport=true} />
{#if showExport && progress >= 100}
<Toolbar class="w-full">
    {#snippet end()}
    <div class="flex items-center space-x-1">
        <Button size="sm" color="alternative" class="gap-1 px-2" onclick={() => {
            if (maximized) {
                if (document.exitFullscreen) {
                    document.exitFullscreen()
                    maximized = false
                }
            }
            else {
                document.documentElement.requestFullscreen()
                maximized = true
            }
        }}>
            {#if maximized}
                <MinimizeOutline></MinimizeOutline>
            {:else}
                <ExpandOutline></ExpandOutline>
            {/if}
        </Button>
        <Button size="sm" color="alternative" class="gap-2 px-3" onclick={() => {
            showExport = false
            setTimeout(() => window.print(), 100)
        }}>
            <FilePdfSolid size="md" class="-ml-1"  />PDF
        </Button>
        <Button size="sm" color="alternative" class="gap-2 px-3" onclick={() => {
            generatingXls = true
            const worker = new XlsxWorker();
            worker.postMessage({locale, devices, tripsByDevice, drivers, groups});
            worker.onmessage = e => {
                const blob = new Blob([e.data.buffer], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "trips.xlsx";
                a.click();
                URL.revokeObjectURL(url);
                generatingXls = false;
                worker.terminate();
            }
        }}>
            {#if generatingXls}
                <Spinner class="me-3" size="4" color="white"/>
            {:else}
                <FileChartBarSolid size="md" class="-ml-1"  />Xlsx
            {/if}
        </Button>
    </div>
    {/snippet}
</Toolbar>
{/if}
{#if progress < 100}
    <Progressbar {progress} labelInside size="h-4" {labelOutside} />
    <div class="flex items-center justify-center h-full">
        <Spinner></Spinner>
    </div>
{:else}
<!-- Professional Report Header -->
<div class="report-header bg-white dark:bg-gray-800 border-b-2 border-blue-600 p-6 mb-6 print:border-black">
    <div class="flex justify-between items-start mb-4">
        <div class="flex-1">

            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-l-4 border-blue-600">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700 dark:text-gray-300">
                    <div>
                        <span class="font-medium">{t('Driver')}</span><br>
                        {drivers.find(d => d.uniqueId === selected)?.name}
                    </div>
                    <div>
                        <span class="font-medium">{t('Period')}</span><br>
                        {new Date(new URLSearchParams(window.location.search).get('from')).toLocaleDateString(locale)} -
                        {new Date(new URLSearchParams(window.location.search).get('to')).toLocaleDateString(locale)}
                    </div>
                    <div>
                        <span class="font-medium">{t('Generation date')}</span><br>
                        {new Date().toLocaleString(locale)}
                    </div>
                </div>
            </div>
        </div>
        <div class="text-right ml-6">
            <img src="https://raw.githubusercontent.com/rastreosat/rastreosat.github.io/refs/heads/main/{window.location.hostname}/logo_large.svg" alt="Company Logo" class="h-8 w-auto mb-2" />
            <div class="text-xl font-bold text-blue-600 dark:text-blue-400 mb-1">{t('Driver report')}</div>
            <div class="text-xs text-gray-400 dark:text-gray-500"></div>
        </div>
    </div>
</div>

    <div bind:this={tbl} class="{showExport && 'overflow-auto max-h-[80vh]'}">
    <Table hoverable striped>
    <TableHead>
        {#each columns as column }
            <TableHeadCell class="text-wrap text-xs p-1">{column}</TableHeadCell>
        {/each}
    </TableHead>
    <TableBody>
        {#each _devices as device}
            {#each tripsByDevice[device.id] as trip, tripIndex}
                <TableBodyRow>
                {#each columns as _, i}
                    <TableBodyCell class="text-xs p-1 text-wrap">
                        {getColumnValue(locale, groups, drivers, devices, device, trip, i, tripsByDevice[device.id][tripIndex + 1])}
                    </TableBodyCell>
                {/each}
                </TableBodyRow>
            {/each}
        {/each}
    </TableBody>
    </Table>
</div>
{/if}

<style>
    @page {
        size: A4;
        margin: 5mm;
    }
    div {
        print-color-adjust: exact;
    }
</style>
