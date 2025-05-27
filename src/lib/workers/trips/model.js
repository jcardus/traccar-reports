import {formatDuration} from "$lib/utils.js";

export const columns = [
    'Véhicule',
    'Groupe',
    'Modèle',
    'Conducteur',
    'Date',
    'Commencer',
    'Fin',
    'Destin',
    'Durée',
    'Ralenti',
    'Arrêt',
    'Distance',
    'Vit. moyenne',
    'Vit. maximale',
    'Consom. (L)',
    'Consom. (L/100)'
]
export function getColumnValue(locale, groups, drivers, devices, device, trip, i) {
    switch (i) {
        case 0:
            return device.name
        case 1:
            return groups.find(g => g.id === device.groupId)?.name
        case 2:
            return device.model
        case 3:
            return drivers.find(d => d.uniqueId === device.attributes.driverUniqueId)?.name
        case 4:
            return new Date(trip.startTime).toLocaleDateString(locale)
        case 5:
            return new Date(trip.startTime).toLocaleTimeString(locale)
        case 6:
            return new Date(trip.endTime).toLocaleTimeString(locale)
        case 7:
            return trip.endAddress
        case 8:
            return formatDuration(new Date(trip.endTime) - new Date(trip.startTime))
        case 9:
            return 0
        case 10:
            return 0
        case 11:
            return Math.round(trip.distance/1000)
        case 12:
            return Math.round(trip.averageSpeed*1.852)
        case 13:
            return Math.round(trip.maxSpeed*1.852)
        case 14:
            return trip.spentFuel
        case 15:
            return Math.round((trip.spentFuel / (trip.distance / 1000)) * 100)
    }
}
