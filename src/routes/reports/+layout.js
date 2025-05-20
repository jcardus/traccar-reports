export async function load({fetch}) {
    const devices = await fetch('/api/devices').then(r => r.json())
    const groups = await fetch('/api/groups').then(r => r.json())
    const drivers = await fetch('/api/drivers').then(r => r.json())
    return {devices, groups, drivers}
}
