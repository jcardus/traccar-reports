<script>
    import {Button, Toggle, Toolbar, Spinner, Datepicker, MultiSelect} from "flowbite-svelte";
    import {setAlert} from "$lib/store.js";
    import {t} from "$lib/i18n.js"
    let loadingReport = $state(false)
    let start = $state(undefined), end=$state(undefined), selected=$state(''), selectAll=$state(false)
    const {devices, report} = $props()
    let reportLoaded = $state(false)
    let tbl

    $effect(() => {
        if (selectAll) {
            selected = []
        }
    })

</script>
{selectAll}
<div class="flex flex-col h-full">
    <Toolbar>
        <div class="p-2 w-full flex gap-2" >
            <MultiSelect
                disabled={selectAll}
                placeholder="{t('Select devices')}..."
                items={devices.sort((a, b) => a.name.localeCompare(b.name)).map(d => ({value: d.id, name: d.name}))}
                bind:value={selected}
                size="xs"
                class="p-2"
            />
            {#if !selected.length || selected.length !== devices.length}
                <Toggle bind:checked={selectAll}>{t('Seleccionar todos')}</Toggle>
            {/if}
        </div>
        <div class="w-72 p-2">
            <Datepicker locale={navigator.language} range bind:rangeFrom={start} bind:rangeTo={end}></Datepicker>
        </div>
        <div class="p-3">
            <Button onclick={() => {
            loadingReport = false
            reportLoaded = false
            if ((selectAll || selected.length) && start && end) {
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
    }} title="report" class="p-4 flex-grow" src="{
    (() => {
        let endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);
        return `/treports/reports/${report
            }?start=${new Date(start).toISOString()
            }&from=${new Date(start).toISOString()
            }&to=${endDate.toISOString()
            }&end=${endDate.toISOString()
            }&${selectAll ? devices.map(d => 'deviceId='+d.id).join('&') : selected.map(s => 'deviceId='+s).join('&')
            }&selected=${selected}`;
    })()
}"></iframe>
    {/if}
</div>
