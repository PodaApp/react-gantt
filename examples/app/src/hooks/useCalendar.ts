
export type GanttData = {month: string, year: number, weeks: string[], startOnDay: number}[];
type GetMonths = (args: {startDate: number}) => GanttData;

import { Month } from "date-fns";
import { enUS } from "date-fns/locale";

const getMonths: GetMonths = ({ startDate }) => {
    const date = new Date(startDate);
    const months = [];
    for (let i = 0; i < 12; i++) {
        months.push({
            month: enUS.localize.month(date.getMonth() as Month, { width: "wide" }) ,
            year: date.getFullYear(),
            weeks: new Array(new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()).fill(null).map((_, i) => new Date(date.getFullYear(), date.getMonth(), i + 1).toString()),
            startOnDay: new Date(date.getFullYear(), date.getMonth(), 1).getDay(),
        });
        date.setMonth(date.getMonth() + 1);
    }

    return months;
}


export const useCalendar = () => {
    return getMonths({startDate: Date.now()});

}