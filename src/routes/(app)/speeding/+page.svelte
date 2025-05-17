<script>
    import {Button, Toolbar, Spinner, Datepicker, MultiSelect} from "flowbite-svelte";
    import {setAlert} from "$lib/store.js";
    import {t} from "$lib/i18n.js"
    let loadingReport = $state(false)
    let start = $state(undefined), end=$state(undefined), selected=$state([])
    const {data} = $props()
    let reportLoaded = $state(false)
    let tbl

</script>
<div class="flex flex-col h-full">
<Toolbar>
    <div class="p-4 w-full" >
        <MultiSelect
                placeholder="{t('Select devices')}..."
                items={data.devices.sort((a, b) => a.name.localeCompare(b.name)).map(d => ({value: d.id, name: d.name}))}
                bind:value={selected}
                size="lg"
        />
    </div>
    <div class="w-72 p-4">
        <Datepicker locale={navigator.language} range bind:rangeFrom={start} bind:rangeTo={end}></Datepicker>
    </div>
    <div class="p-4">
        <Button onclick={() => {
            loadingReport = false
            reportLoaded = false
            if (selected && selected.length && start && end) {
                setTimeout(() => loadingReport = true, 100)
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
</Toolbar>

{#if loadingReport || reportLoaded}
    <iframe onload={() => {
        reportLoaded=true
        loadingReport=false
    }} title="report" class="flex-grow" src="{
    (() => {
        let endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);
        return `/reports/reports/speeding?start=${new Date(start).toISOString()}&end=${endDate.toISOString()}&selected=${selected}`;
    })()
}"></iframe>
{/if}
</div>
