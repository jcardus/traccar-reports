import {formatDuration} from "$lib/utils.js";

export const columns = [
    'Veículo',
    'Grupo',
    'Data',
    'Início',
    'Fim',
    'Destino',
    'Duração',
    'Distância',
    'Vel. Média',
    'Vel. Máxima',
]
export function getColumnValue(locale, groups, drivers, devices, device, trip, i) {
    switch (i) {
        case 0:
            return device.name
        case 1:
            return groups.find(g => g.id === device.groupId)?.name
        case 2:
            return new Date(trip.startTime).toLocaleDateString(locale)
        case 3:
            return new Date(trip.startTime).toLocaleTimeString(locale)
        case 4:
            return new Date(trip.endTime).toLocaleTimeString(locale)
        case 5:
            return trip.endAddress
        case 6:
            return formatDuration(new Date(trip.endTime) - new Date(trip.startTime))
        case 7:
            return Math.round(trip.distance/1000)
        case 8:
            return Math.round(trip.averageSpeed*1.852)
        case 9:
            return Math.round(trip.maxSpeed*1.852)
    }
}
