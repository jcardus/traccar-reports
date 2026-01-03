import {loadingReport} from "$lib/store.js";

export const ssr = false

async function getTolls(deviceId, searchParams, request) {
    const cookie = request && request.headers.get('cookie')
    loadingReport.set(true)
    let tolls = []
    // Fetch tolls for each device
    const url = `/api/reports/tolls?deviceId=${deviceId}&from=${searchParams.get('from')}&to=${searchParams.get('to')}`;
    const response = await fetch(url, {headers: {cookie, redirect: 'follow'}})
    if (response.ok) {
        tolls = await response.json()
    }

    loadingReport.set(false)
    return tolls
}

export async function load({request}) {
    const cookie = request && request.headers.get('cookie')
    const searchParams = new URLSearchParams(window.location.search)
    const deviceId = searchParams.get('deviceId')
    return {
        locale: navigator.language,
        device: fetch('/api/devices/'+deviceId, {headers: {cookie, redirect: 'follow'}}).then(r => r.json()),
        tolls: getTolls(deviceId, searchParams, request)
    }
}
