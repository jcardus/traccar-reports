<script>
    import {
        Button, Heading,
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead, Progressbar,
        TableHeadCell, Toolbar
    } from "flowbite-svelte";
    import { t } from "$lib/i18n";
    import {ExpandOutline, FileChartBarSolid, FilePdfSolid, MinimizeOutline} from "flowbite-svelte-icons";
    import { utils, writeFileXLSX } from 'xlsx';
    const { data } = $props();
    const {devices, drivers, groups} = data
    let showExport = $state(true)
    let tbl
    let maximized = $state(false)
    import {formatDuration, intervalToDuration} from "date-fns";
    import {onMount} from "svelte";
    let progress = $state(0)

    function getDriver(trip) {
        const uniqueId = data.devices.find(d => d.id === trip.deviceId)?.attributes.driverUniqueId
        return drivers.find(d => d.uniqueId === uniqueId)
    }

    const tripsByDevice = {}
    function getTrips(deviceId) {
        if (!tripsByDevice[deviceId]) {
            const params = new URLSearchParams(window.location.search)
            const newParams = new URLSearchParams({
                deviceId,
                from: params.get('from'),
                to: params.get('to')
            })
            tripsByDevice[deviceId] = fetch('/api/reports/trips?' + newParams).then(r => r.json())
        }
        return tripsByDevice[deviceId]
    }

    onMount(async () => {
        let i = 1
        for (const d of devices) {
            await getTrips(d.id)
            progress = i++ / devices.length * 100
        }
    })

</script>

<svelte:window on:afterprint={() => showExport=true} />
{#if showExport }
<Progressbar {progress} labelInside size="h-4" />
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
            const elt = tbl.getElementsByTagName("TABLE")[0];
            const wb = utils.table_to_book(elt);
            writeFileXLSX(wb, "speeding.xlsx");
        }}>
            <FileChartBarSolid size="md" class="-ml-1"  />Xlsx
        </Button>
    </div>
    {/snippet}
</Toolbar>
{/if}

<Heading tag="h1" class="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl p-4">
    {t('Rapport de voyage')}
</Heading>

<div bind:this={tbl}>
    <Table hoverable striped>
    <TableHead>
        <TableHeadCell class="text-center text-2xs p-1">Véhicule</TableHeadCell>
        <TableHeadCell class="text-center text-2xs p-1">Groupe</TableHeadCell>
        <TableHeadCell class="text-center text-2xs p-1">Modèle</TableHeadCell>
        <TableHeadCell class="text-center text-2xs p-1">Conducteur</TableHeadCell>
        <TableHeadCell class="text-center text-2xs p-1">Date</TableHeadCell>
        <TableHeadCell class="text-center text-2xs p-1">Commencer</TableHeadCell>
        <TableHeadCell class="text-center text-2xs p-1">Fin</TableHeadCell>
        <TableHeadCell class="text-center text-2xs p-1">Destin</TableHeadCell>
        <TableHeadCell class="text-center text-2xs p-1">Durée</TableHeadCell>
        <TableHeadCell class="text-center text-2xs p-1">Ralenti</TableHeadCell>
        <TableHeadCell class="text-center text-2xs p-1">Arrêt</TableHeadCell>
        <TableHeadCell class="text-center text-2xs p-1">Distance</TableHeadCell>
        <TableHeadCell class="text-center text-2xs p-1">Vit. moyenne</TableHeadCell>
        <TableHeadCell class="text-center text-2xs p-1">Vit. maximale</TableHeadCell>
        <TableHeadCell class="text-center text-2xs p-1">Consom. (L)</TableHeadCell>
        <TableHeadCell class="text-center text-2xs p-1">Consom. (L/100)</TableHeadCell>
    </TableHead>
    <TableBody>
        {#each devices as device, i}
            {#await getTrips(device.id, i)}
                <TableBodyRow>
                    <TableBodyCell colspan="16">
                        Loading {device.name}...<br>
                    </TableBodyCell>
                </TableBodyRow>
            {:then trips}
            {#each trips as trip}
                {#if progress >= 100}
            <TableBodyRow>
                <TableBodyCell class="text-2xs p-1 text-wrap">
                    {devices.find(d => d.id === trip.deviceId)?.name}
                </TableBodyCell>
                <TableBodyCell class="text-2xs p-1 text-wrap">
                    {groups.find(d => d.id === devices.find(d => d.id === trip.deviceId)?.groupId)?.name}
                </TableBodyCell>
                <TableBodyCell class="text-2xs p-1 text-wrap">
                    {devices.find(d => d.id === trip.deviceId)?.model}
                </TableBodyCell>
                <TableBodyCell class="text-2xs p-1 text-wrap">
                    {getDriver(trip)?.name}
                </TableBodyCell>
                <TableBodyCell class="text-2xs p-1">
                    {new Date(trip.startTime).toLocaleDateString()}
                </TableBodyCell>
                <TableBodyCell class="text-2xs p-1">
                    {new Date(trip.startTime).toLocaleTimeString()}
                </TableBodyCell>
                <TableBodyCell class="text-2xs p-1">
                    {new Date(trip.endTime).toLocaleTimeString()}
                </TableBodyCell>
                <TableBodyCell class="text-2xs p-1 text-wrap">
                    {trip.endAddress}
                </TableBodyCell>
                <TableBodyCell class="text-2xs p-1 text-wrap">
                    {formatDuration(intervalToDuration({
                        start: new Date(trip.startTime),
                        end: new Date(trip.endTime)
                    }))
                    }
                </TableBodyCell>
                <TableBodyCell class="text-2xs p-1">
                    0
                </TableBodyCell>
                <TableBodyCell class="text-2xs p-1">
                    0
                </TableBodyCell>
                <TableBodyCell class="text-2xs p-1">
                    {Math.round(trip.distance/1000)}
                </TableBodyCell>
                <TableBodyCell class="text-2xs p-1">
                    {Math.round(trip.averageSpeed*1.852)}
                </TableBodyCell>
                <TableBodyCell class="text-2xs p-1">
                    {Math.round(trip.maxSpeed*1.852)}
                </TableBodyCell>
                <TableBodyCell class="text-2xs p-1">
                    {trip.spentFuel}
                </TableBodyCell>
                <TableBodyCell class="text-2xs p-1">
                    {Math.round(trip.spentFuel/trip.distance)}
                </TableBodyCell>
            </TableBodyRow>
                    {/if}
            {/each}
            {/await}
        {/each}
    </TableBody>
</Table>
</div>

<style>
    @page {
        size: A4 landscape;
        margin: 2mm;
    }
    div {
        print-color-adjust: exact;
    }
</style>
