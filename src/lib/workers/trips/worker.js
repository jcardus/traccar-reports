import { utils, write } from 'xlsx';
import {columns, getColumnValue} from "./model";

self.onmessage = function (e) {
    const {locale, groups, drivers, devices, tripsByDevice} = e.data;
    const rows = []
    rows.push(columns)
    devices.forEach(device => {
        const trips = tripsByDevice[device.id]
        trips.forEach((trip, tripIndex) => {
            const row = []
            columns.forEach((c, i) => row.push(
                getColumnValue(locale, groups, drivers, devices, device, trip, i, tripsByDevice[device.id][tripIndex + 1])))
            rows.push(row)
        })
    })
    const ws = utils.aoa_to_sheet(rows);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Sheet1");
    const bout = write(wb, { bookType: "xlsx", type: "array" });
    self.postMessage({ buffer: bout }, [bout]);
};
