<script>
    import {Button, Heading, Toolbar, Spinner, Datepicker} from "flowbite-svelte";
    import {setAlert} from "$lib/store.js";
    let loadingReport = $state(false)
    let start = $state(undefined), end = $state(undefined), selected = $state(undefined), datePicker = $state(undefined)
    const {data} = $props()
    let reportLoaded = $state(false)
    import {t} from '$lib/i18n.js'
    import SelectDevice from "$lib/components/SelectDevice.svelte";
    let devices = $derived(data.devices)

</script>

<Heading tag="h1" class="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
    {t('Position report')}
</Heading>
<Toolbar >
    <div class="flex gap-4">
        <SelectDevice devices={devices} bind:selected="{selected}"/>
    </div>
    <div class="p-4 w-96">
        <Datepicker locale={navigator.language} range bind:rangeFrom={start} bind:rangeTo={end} bind:datePicker="{datePicker}"></Datepicker>
    </div>
    <div class="p-4">
        <Button onclick={async () => {
            loadingReport = false
            reportLoaded = false
            if (selected && start && end) {
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
        end = new Date(end);
        end.setHours(23, 59, 59, 999);
    }} title="report" class="h-full w-full pb-4" src="{
        `/treports/reports/positions?start=${new Date(start).toISOString()}&end=${new Date(end).toISOString()}&selected=${selected}`
    }"></iframe>
{/if}
