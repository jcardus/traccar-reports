<script>
    import Report from "$lib/components/Report.svelte";
    const {data} = $props()
    let {devices} = data
</script>

<Report {devices} report="tolls"></Report>
