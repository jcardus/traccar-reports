<script>
    import {
        Heading,
        Table,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell,
        Toolbar,
        Spinner
    } from "flowbite-svelte";
    import { t } from "$lib/i18n";
    import {showExport, loadingReport} from '$lib/store.js'
    import ExportReport from "$lib/components/ExportReport.svelte";

    export let data;
    let tbl;

</script>

<svelte:window on:afterprint={() => showExport.set(true)} />
{#if $loadingReport}
    <div class="flex items-center justify-center h-full">
        <Spinner></Spinner>
    </div>
{:else}
<div style="padding: 10px">
{#if $showExport }
    <Toolbar class="w-full">
        {#snippet end()}
            <ExportReport></ExportReport>
        {/snippet}
    </Toolbar>
{/if}
    {#await data.tolls}
    {:then tolls}
        {#if !tolls || !tolls.length}
            <div class="text-xl text-gray-900 dark:text-white">{t('no data')}</div>
        {:else}
            {#await data.device}
            {:then device}
                <div class="flex justify-between items-center p-4">
                    <Heading tag="h1" class="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
                        {t('Tolls report')}
                    </Heading>
                    <span class="text-lg font-medium text-gray-700 dark:text-gray-300">{device.name}</span>
                </div>
            {/await}
            <div bind:this={tbl}>
                <Table hoverable="true" class="table-fixed p-0">
                    <TableHead class="border-y border-gray-200 bg-gray-100 dark:border-gray-700">
                        <TableHeadCell class="text-center">{t('time')}</TableHeadCell>
                        <TableHeadCell class="text-center">{t('address')}</TableHeadCell>
                        <TableHeadCell class="text-center">{t('valor')}</TableHeadCell>
                        <TableHeadCell class="text-center">{t('Operador')}</TableHeadCell>
                        <TableHeadCell class="text-center">{t('Mapa')}</TableHeadCell>
                    </TableHead>
                    <TableBody>
                        {#each tolls as toll}
                            <TableBodyRow>
                                <TableBodyCell class="text-center overflow-hidden overflow-ellipsis p-0">
                                    {new Date(toll.originalPosition.fixTime).toLocaleString()}
                                </TableBodyCell>
                                <TableBodyCell class="p-2 text-center whitespace-pre-wrap">
                                    {toll.way.tags.name} {toll.node.tags.note}
                                </TableBodyCell>
                                <TableBodyCell class="p-2 text-center whitespace-pre-wrap">
                                    {toll.node.tags.charge.split(';')[0]}
                                </TableBodyCell>
                                <TableBodyCell class="p-0 text-center whitespace-normal">
                                    {toll.node.tags.operator}
                                </TableBodyCell>
                                <TableBodyCell class="text-center">
                                    <a target="_blank"
                                       href="https://www.openstreetmap.org/node/{toll.node.id}"
                                       class="text-blue-600 hover:underline dark:text-blue-500"
                                       aria-label="view map">
                                        Ver Mapa
                                    </a>
                                </TableBodyCell>
                            </TableBodyRow>
                        {/each}
                    </TableBody>
                </Table>
            </div>
        {/if}
    {/await}
</div>
{/if}

<style>
    @page {
        size: A4 landscape;
        margin: 10mm;
    }
    div {
        print-color-adjust: exact;
    }
</style>
