<script>
    import {
        Heading,
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell, Toolbar, Spinner
    } from "flowbite-svelte";
    import { t } from "$lib/i18n";
    export let data;
    import {showExport, loadingReport} from '$lib/store.js'

    import { es, pt } from 'date-fns/locale';
    import ExportReport from "$lib/components/ExportReport.svelte";
    const locales = { es, pt };
    let tbl
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY
    import polyline from '@mapbox/polyline';


    function buildGoogleStaticMapURL(coordinates) {
        const baseUrl = "https://maps.googleapis.com/maps/api/staticmap?"
        const size = "size=300x200";
        const pathPoints = coordinates.map(p => [p.latitude, p.longitude])
        const encodedPath = polyline.encode(pathPoints);
        const path = `path=weight:6|enc:${encodedPath}`
        const start = coordinates[0]
        const end = coordinates[coordinates.length - 1]
        let markers = `markers=label:A|${start.latitude},${start.longitude}&markers=label:B|${end.latitude},${end.longitude}`
        return `${baseUrl}${size}&${markers}&${path}&key=${apiKey}`
    }
    async function getPositions(trip) {
        const response = await fetch('/api/positions?' + new URLSearchParams({
            deviceId: trip.deviceId,
            from: trip.startTime,
            to: trip.endTime
        }))
        if (response.ok) {
            return response.json()
        }
        return []
    }
</script>
<svelte:window on:afterprint={() => showExport.set(true)} />
{#if $loadingReport}
    <div class="flex items-center justify-center h-full">
        <Spinner></Spinner>
    </div>
{/if}
<div style="padding: 10px">
{#if $showExport }
    <Toolbar class="w-full">
        {#snippet end()}
            <ExportReport></ExportReport>
        {/snippet}
    </Toolbar>
{/if}
    {#await data.trips}
        {:then trips}
        {#if !trips.length}
            <div class="text-xl text-gray-900 dark:text-white">{t('no data')}</div>
        {:else}
            <Heading tag="h1" class="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl pb-4">
                {t('ECO driving')}
            </Heading>
<div bind:this={tbl}>
    <Table hoverable="true" class="table-fixed p-0">
    <TableHead class="border-y border-gray-200 bg-gray-100 dark:border-gray-700">
        <TableHeadCell class="text-center w-24">{t('vehicle')}</TableHeadCell>
        <TableHeadCell class="text-center w-64">{t('start')} (A)</TableHeadCell>
        <TableHeadCell class="text-center w-64">{t('end')} (B)</TableHeadCell>
        <TableHeadCell class="text-center w-64"></TableHeadCell>
    </TableHead>
    <TableBody>
        {#each trips as trip}
            <TableBodyRow>
                <TableBodyCell class="text-center overflow-hidden overflow-ellipsis p-0">
                    {data.devices.find(d => d.id === trip.deviceId)?.name}
                </TableBodyCell>
                {#await getPositions(trip)}
                {:then positions}
                    <TableBodyCell class="text-center overflow-hidden overflow-ellipsis p-0">
                        {new Date(trip.startTime).toLocaleString()}<br>
                        <span title="{positions[0]?.address}">{positions[0]?.address}</span>
                    </TableBodyCell>
                    <TableBodyCell class="text-center overflow-hidden overflow-ellipsis p-0">
                        {new Date(trip.endTime).toLocaleString()}<br>
                        <span title="{positions[positions.length-1]?.address}">{positions[positions.length-1]?.address}</span>
                    </TableBodyCell>
                    <TableBodyCell class="p-0 text-center whitespace-normal ">
                        <a target="_blank"
                           href="/ces?{new URLSearchParams({
                            deviceId: trip.deviceId,
                            from: trip.startTime,
                            to: trip.endTime})}"
                           aria-label="map">
                            <img src="{buildGoogleStaticMapURL(positions)}" alt="map">
                        </a>tr
                    </TableBodyCell>
                {/await}
            </TableBodyRow>
        {/each}
    </TableBody>
</Table>
</div>
        {/if}
    {/await}
</div>


<style>
    @page {
        size: A4 landscape;
        margin: 10mm;
    }
    div {
        print-color-adjust: exact;
    }
</style>
