<script>
    import Report from "$lib/components/Report.svelte";
    const {data} = $props()
    let {devices} = data
    const report = 'trips'
</script>

<Report {devices} {report}></Report>
