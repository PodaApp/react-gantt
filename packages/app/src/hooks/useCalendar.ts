import { eachDayOfInterval, getDay, Month } from "date-fns";
import { enUS } from "date-fns/locale";

import { useGanttStore } from "../store/ganttStore";

export type GanttData = { month: string; year: number; weeks: string[]; mondays: number[]; startOnDay: number }[];

export const useCalendar = () => {
	const dateStart = useGanttStore.use.ganttDateStart();
	const dateEnd = useGanttStore.use.ganttDateEnd();

	const calendar: GanttData = [];

	for (let current = new Date(dateStart), end = new Date(dateEnd); current <= end; current.setMonth(current.getMonth() + 1), current.setDate(1)) {
		const dateFirstOfMonth = new Date(current.getFullYear(), current.getMonth(), 1);
		const dateLastOfMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0);

		const firstDateInRange = current.getTime() === dateStart.getTime() ? current : dateFirstOfMonth;

		const mondays = _getMondaysInRange(firstDateInRange, dateLastOfMonth);

		const iterationStartDate = current.getTime() > dateFirstOfMonth.getTime() ? current : dateFirstOfMonth;
		const iterationEndDate = end.getTime() < dateLastOfMonth.getTime() ? end : dateLastOfMonth;

		const daysInMonth = [];
		for (let day = iterationStartDate.getDate(); day <= iterationEndDate.getDate(); day++) {
			daysInMonth.push(new Date(current.getFullYear(), current.getMonth(), day).toString());
		}

		calendar.push({
			month: enUS.localize.month(current.getMonth() as Month, { width: "wide" }),
			year: current.getFullYear(),
			weeks: daysInMonth,
			mondays,
			startOnDay: new Date(current.getFullYear(), current.getMonth(), 1).getDay(),
		});
	}

	return calendar;
};

const _getMondaysInRange = (startDate: Date, endDate: Date): number[] => {
	return eachDayOfInterval({ start: startDate, end: endDate })
		.map((date, index) => ({ date, index }))
		.filter(({ date }) => getDay(date) === 1)
		.map(({ index }) => index);
};
