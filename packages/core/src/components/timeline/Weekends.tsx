import { differenceInDays, getDay } from "date-fns";

import { useGanttStore } from "../../hooks/useGanttStore";
import { Weekend } from "./Weekend";

export const Weekends = () => {
	const dateStart = useGanttStore((state) => state.ganttDateStart);
	const dateEnd = useGanttStore((state) => state.ganttDateEnd);

	const weekends = _getWeekendOffsetDays(dateStart, dateEnd);

	return (
		<>
			{weekends.map((daysOffset) => (
				<Weekend key={daysOffset} daysOffset={daysOffset} />
			))}
		</>
	);
};

const _getWeekendOffsetDays = (dateStart: Date, dateEnd: Date) => {
	const startDayOfWeek = getDay(dateStart);
	const totalDays = differenceInDays(dateEnd, dateStart);

	const firstSaturday = startDayOfWeek === 0 ? -1 : 6 - startDayOfWeek;
	const weekends: number[] = [];

	for (let day = firstSaturday; day <= totalDays; day += 7) {
		weekends.push(day);
	}

	return weekends;
};
