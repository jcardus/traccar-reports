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
    import {formatDuration, intervalToDuration} from "date-fns";
    import { Rating, Star } from "flowbite-svelte";
    const wrapper = (props) => (anchor, _props) => Star(anchor, { ..._props, ...props });

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
    async function getEventsAndPositions(trip) {
        const result = {}
        let response = await fetch('/api/positions?' + new URLSearchParams({
            deviceId: trip.deviceId,
            from: trip.startTime,
            to: trip.endTime
        }))
        if (response.ok) {
            result.positions = await response.json()
        }
        response = await fetch('/api/reports/events?' + new URLSearchParams({
            deviceId: trip.deviceId,
            from: trip.startTime,
            to: trip.endTime
        }))
        if (response.ok) {
            result.events = (await response.json()).filter(e => ![
                'ignitionOn',
                'deviceMoving',
                'deviceOffline',
                'deviceOnline',
                'commandResult',
                'ignitionOff',
                'deviceUnknown',
                'deviceStopped'
            ].includes(e.type))
        }
        return result
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
            <Heading tag="h1" class="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl p-4">
                {t('ECO driving')}
            </Heading>
            <div bind:this={tbl}>
                <Table hoverable="true" class="table-fixed p-0">
                <TableHead class="border-y border-gray-200 bg-gray-100 dark:border-gray-700">
                    <TableHeadCell class="text-center w-24">{t('vehicle')}</TableHeadCell>
                    <TableHeadCell class="text-center">{t('start')} (A)</TableHeadCell>
                    <TableHeadCell class="text-center">{t('end')} (B)</TableHeadCell>
                    <TableHeadCell class="text-center">{t('route3d')}</TableHeadCell>
                    <TableHeadCell class="text-center">{t('rating')}</TableHeadCell>
                </TableHead>
                <TableBody>
                    {#each trips as trip}
                        <TableBodyRow>
                            <TableBodyCell class="text-wrap">
                                {data.devices.find(d => d.id === trip.deviceId)?.name}
                            </TableBodyCell>
                            {#await getEventsAndPositions(trip)}
                            {:then {positions, events}}
                                <TableBodyCell class="text-center">
                                    <b>{new Date(trip.startTime).toLocaleString()}</b><br>
                                    <span class="text-wrap text-xs" title="{positions[0]?.address}">{positions[0]?.address}</span>
                                </TableBodyCell>
                                <TableBodyCell class="text-center">
                                    <b>{new Date(trip.endTime).toLocaleString()}</b><br>
                                    <span class="text-wrap text-xs" title="{positions[positions.length-1]?.address}">{positions[positions.length-1]?.address}</span>
                                </TableBodyCell>
                                <TableBodyCell>
                                    <a target="_blank"
                                       href="/ces?{new URLSearchParams({
                                        name: data.devices.find(d => d.id === trip.deviceId)?.name,
                                        deviceId: trip.deviceId,
                                        from: trip.startTime,
                                        to: trip.endTime})}"
                                       aria-label="map">
                                        <img src="{buildGoogleStaticMapURL(positions)}" alt="map">
                                    </a>
                                </TableBodyCell>
                                <TableBodyCell>
                                    <b>{Math.round(trip.distance/1000)} Kms</b>, {t('avgSpeed')}: {trip.averageSpeed.toFixed(1)} Km/h<br>
                                    <b>{formatDuration(intervalToDuration({
                                        start: new Date(positions[0].fixTime),
                                        end: new Date(positions.slice(-1)[0].fixTime)
                                    }), {locale: locales[window.navigator.language] || pt})}</b><br>
                                    <b>{t('harshBrakes')}:</b> {events.filter(e => e.attributes.alarm === 'hardBraking').length}<br>
                                    <b>{t('harshCornering')}:</b> {events.filter(e => e.attributes.alarm === 'hardCornering').length}<br>
                                    <b>{t('harshAccelerations')}:</b> {events.filter(e => e.attributes.alarm === 'hardAcceleration').length}<br>
                                    <b>{t('fuelUsed')}:</b> {trip.spentFuel.toFixed(1)}l<br>
                                    <b>{t('consumption')}: {Math.min((trip.spentFuel/(trip.distance/1000)).toFixed(1), 50)} l/km</b><br>
                                    <Rating id="example-1b" icon={wrapper({ fillColor: "#008800", strokeColor: "#008800" })} total={5} size={35} rating={5 - events.length/2}>
                                        {#snippet text()}
                                            <p class="p-2 text-xl"> {(5 - events.length/2).toFixed(1)}</p>
                                        {/snippet}
                                    </Rating>
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
