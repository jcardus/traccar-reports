<script>
    import {utils, writeFileXLSX} from "xlsx";
    import {ExpandOutline, FileChartBarSolid, FilePdfSolid, MinimizeOutline} from "flowbite-svelte-icons";
    import {Button} from "flowbite-svelte";
    import {showExport} from "$lib/store.js";

    let maximized = $state(false);
</script>

<div class="flex items-center space-x-2">
    <Button size="sm" color="alternative" class="gap-2 px-3" onclick={() => {
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
                    showExport.set(false)
                    setTimeout(() => window.print(), 100)
                }}>
        <FilePdfSolid size="md" class="-ml-1"  />PDF
    </Button>
    <Button size="sm" color="alternative" class="gap-2 px-3" on:click={() => {
                    const elt = tbl.getElementsByTagName("TABLE")[0];
                    const wb = utils.table_to_book(elt);
                    writeFileXLSX(wb, "speeding.xlsx");
                }}>
        <FileChartBarSolid size="md" class="-ml-1"  />Xlsx
    </Button>
</div>
