<script>
    import {Button, Heading, Toolbar, Spinner} from "flowbite-svelte";
    import {setAlert} from "$lib/store.js";
    let loadingReport = $state(false)
    let start = $state(''), end = $state(''), selected = $state(undefined)
    const {data} = $props()
    let reportLoaded = $state(false)
    import {t} from '$lib/i18n.js'
    import SelectDriver from "$lib/components/SelectDriver.svelte";
    let drivers = $derived(data.drivers)
</script>

{#if !reportLoaded}
    <Heading tag="h1" class="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl p-4">
        {t('Driver report')}
    </Heading>
{/if}
<Toolbar >
    <div class="flex gap-4">
        <SelectDriver drivers={drivers} bind:selected="{selected}"/>
    </div>
    <div class="p-4 flex gap-2">
        <div class="flex flex-col">
            <input type="date" bind:value={start} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
        </div>
        <div class="flex flex-col">
            <input type="date" bind:value={end} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
        </div>
    </div>
    <div class="p-4">
        <Button onclick={async () => {
            loadingReport = false
            reportLoaded = false
            if (selected && start && end) {
                loadingReport = true
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
        let endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);
        end = endDate.toISOString().split('T')[0];
    }} title="report" class="h-full w-full pb-4" src="{
        `/treports/reports/driver?from=${new Date(start).toISOString()}&to=${new Date(end).toISOString()}&selected=${selected}`
    }"></iframe>
{/if}
