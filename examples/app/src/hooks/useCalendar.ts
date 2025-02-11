import { Month } from "date-fns";
import { enUS } from "date-fns/locale";

import { useGanttStore } from "../store/ganttStore";

export type GanttData = { month: string; year: number; weeks: string[]; startOnDay: number }[];

export const useCalendar = () => {
	const dateStart = useGanttStore.use.ganttDateStart();
	const dateEnd = useGanttStore.use.ganttDateEnd();

	const current = new Date(dateStart);
	const end = new Date(dateEnd);

	const calendar: GanttData = [];

	while (current <= end) {
		const firstDayOfMonth = new Date(current.getFullYear(), current.getMonth(), 1);
		const lastDayOfMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0);

		const iterationStartDate = current.getTime() > firstDayOfMonth.getTime() ? current : firstDayOfMonth;
		const iterationEndDate = end.getTime() < lastDayOfMonth.getTime() ? end : lastDayOfMonth;

		const daysInMonth = [];
		for (let day = iterationStartDate.getDate(); day <= iterationEndDate.getDate(); day++) {
			daysInMonth.push(new Date(current.getFullYear(), current.getMonth(), day).toString());
		}

		calendar.push({
			month: enUS.localize.month(current.getMonth() as Month, { width: "wide" }),
			year: current.getFullYear(),
			weeks: daysInMonth,
			startOnDay: new Date(current.getFullYear(), current.getMonth(), 1).getDay(),
		});

		current.setMonth(current.getMonth() + 1);
		current.setDate(1);
	}

	return calendar;
};
