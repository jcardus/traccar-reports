<script>
    import {
        Button, Heading,
        Table, Badge,
        TableBody,
        TableBodyCell,
        TableBodyRow,
        TableHead,
        TableHeadCell, Toolbar, Spinner
    } from "flowbite-svelte";
    import { t } from "$lib/i18n";
    import {ExpandOutline, FileChartBarSolid, FilePdfSolid, MinimizeOutline} from "flowbite-svelte-icons";
    import { utils, writeFileXLSX } from 'xlsx';
    const { data } = $props();
    let showExport = $state(true)
    let tbl
    let maximized = $state(false)
    import {loadingReport} from '$lib/store'

</script>

<svelte:window on:afterprint={() => showExport=true} />
{#if $loadingReport}
    <div class="flex items-center justify-center h-full">
        <Spinner></Spinner>
    </div>
{:else}
{#if showExport }
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

<Heading tag="h1" class="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
    {t('Rapport de voyage')}
</Heading>
    {#await data.trips}
    {:then trips}
<div class="p-2">
    <Badge>{trips.length}</Badge>
</div>
<div bind:this={tbl}>
    <Table hoverable="true">
    <TableHead>
        <TableHeadCell class="text-center">Véhicule</TableHeadCell>
        <TableHeadCell class="text-center">Groupe</TableHeadCell>
        <TableHeadCell class="text-center">Modèle</TableHeadCell>
        <TableHeadCell class="text-center">Conducteur</TableHeadCell>
        <TableHeadCell class="text-center">Date</TableHeadCell>
        <TableHeadCell class="text-center">Commencer</TableHeadCell>
        <TableHeadCell class="text-center">Fin</TableHeadCell>
        <TableHeadCell class="text-center">Destin</TableHeadCell>
        <TableHeadCell class="text-center">Durée</TableHeadCell>
        <TableHeadCell class="text-center">tourner au ralenti</TableHeadCell>
        <TableHeadCell class="text-center">Arrêt</TableHeadCell>
        <TableHeadCell class="text-center">Distance</TableHeadCell>
        <TableHeadCell class="text-center">Vitesse moyenne</TableHeadCell>
        <TableHeadCell class="text-center">Vitesse maximale</TableHeadCell>
        <TableHeadCell class="text-center">Consommation (L)</TableHeadCell>
        <TableHeadCell class="text-center">Consommation (L/100)</TableHeadCell>
    </TableHead>
    <TableBody>
        {#each trips as trip}
            <TableBodyRow>
                    <TableBodyCell >
                        {data.devices.find(d => d.id === trip.deviceId).name}
                    </TableBodyCell>
            </TableBodyRow>
        {/each}

    </TableBody>
</Table>
</div>
{/await}

<style>
    @page {
        size: A4 landscape;
        margin: 10mm;
    }
    div {
        print-color-adjust: exact;
    }
</style>
{/if}
