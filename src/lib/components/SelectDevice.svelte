<script>
    import {Select} from 'flowbite-svelte';
    let {selected = $bindable(), devices} = $props();
    import {t} from '$lib/i18n'
    import {onMount} from "svelte";
    import Choices from "choices.js";
    let selectRef = $state()

    onMount(() => {
        new Choices(selectRef);

    })
</script>

<Select bind:elementRef={selectRef} placeholder="{t('Select device')}..." items={
    devices.sort((a, b) => a.name.localeCompare(b.name)).map(d => ({value: d.id, ...d}))
    } bind:value={selected} size="lg"
/>
