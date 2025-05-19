import {loadingReport} from "$lib/store.js";

export const ssr = false
export async function load({fetch}) {
    loadingReport.set(true)
    const devices = await fetch('/api/reports/devices').then(r => r.json)
    return {
        devices,
        trips: fetch('/api/reports/trips'+window.location.search,
            {headers: {accept: 'application/json'}}).then(r => {
            loadingReport.set(false)
            return r.json()
        })
    }
}
