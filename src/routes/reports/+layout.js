export async function load({fetch}) {
    const response = await fetch('/api/devices');
    if (response.ok) {
        const devices = await response.json()
        return {devices: devices.slice(0, 500)}
    }
    return {devices: []}
}
