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
    import SpeedLimitSign from "$lib/components/SpeedLimitSign.svelte";
    import {VisXYContainer, VisAxis, VisArea, VisTooltip, VisCrosshair, VisLine} from '@unovis/svelte'
    export let data;
    import {showExport, loadingReport} from '$lib/store.js'

    import {formatDuration, intervalToDuration} from "date-fns";
    import distance from "@turf/distance";
    import {point} from "@turf/helpers";
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
    const template = d => `${new Date(d.fixTime).toLocaleTimeString()}<br>${Math.round(d.speed * 1.852)} km/h`
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
        <TableHeadCell class="text-center p-0 w-64">{t('speeding')}</TableHeadCell>
        <TableHeadCell class="text-center w-[310px]">{t('map')}</TableHeadCell>
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
                    <a target="_blank" href="http://localhost:5174/ces{window.location.search}">
                        <img src="{buildGoogleStaticMapURL(positions)}">
                    </a>tr
                </TableBodyCell>
                <!--TableBodyCell class="text-center {event.positions.length === 1 && 'text-lg'}">
                    {#if event.positions.length > 1}
                        <VisXYContainer height="100" data={event.positions}>
                            <VisArea color="darkgreen" opacity={0.2} x={d => new Date(d.fixTime)} y={d => d.speed*1.852} />
                            <VisLine color="darkgreen" x={d => new Date(d.fixTime)} y={d => d.speed*1.852} />
                            <VisLine color="red" strokeDasharray="5,5" x={d => new Date(d.fixTime)} y={event.edges[0].speed_limit} />
                            <VisAxis type="x" tickFormat="{(x) => new Date(x).toLocaleTimeString()}" />
                            <VisAxis type="y" />
                            <VisCrosshair {template}></VisCrosshair>
                            <VisTooltip/>
                        </VisXYContainer>
                        {
                            formatDuration(intervalToDuration({
                                start: new Date(event.positions[0].fixTime),
                                end: new Date(event.positions.slice(-1)[0].fixTime)
                            }), {locale: locales[data.locale] || pt})
                        }
                        {
                            event.positions.reduce((acc, current, index, positions) => {
                                if (index === 0) return acc
                                const previousPosition = positions[index - 1]
                                const point1 = point([previousPosition.longitude, previousPosition.latitude])
                                const point2 = point([current.longitude, current.latitude])
                                return acc + distance(point1, point2, { units: 'kilometers' })
                            }, 0).toFixed(1) + ' km'
                        }
                        <br>
                        {
                            (event.positions.reduce((acc, current) => current.speed > acc ? current.speed : acc, 0) * 1.852).toFixed(1)
                        } km/h

                    {:else}
                        {(event.positions[0].speed * 1.852).toFixed(1)} km/h
                    {/if}
                </TableBodyCell-->

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
