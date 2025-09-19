<script>
    import {Select} from 'flowbite-svelte';
    export let selected;
    export let drivers;
    import {t} from '$lib/i18n'
</script>

<Select placeholder="{t('Select driver')}..." items={
    drivers.sort((a, b) => a.name.localeCompare(b.name)).map(d => ({value: d.uniqueId, ...d}))
    } bind:value={selected} size="lg"
/>
