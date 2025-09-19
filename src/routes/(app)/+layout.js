import {goto} from "$app/navigation";
export const ssr = false
export async function load({fetch}) {
    try {
        const response = await fetch('/api/devices');
        if (response.ok) {
            const _devices = await response.json()
            const drivers = await fetch('/api/drivers').then(r => r.json())
            return {devices: _devices.slice(0, 500), drivers}
        } else {
            if (response.status === 401 || response.status === 403) {
                await goto('/login')
                return
            }
            else { alert(await response.text()) }
        }
    } catch (e) {
        alert(e.message)
    }
    return {devices: []}
}
