import { eachDayOfInterval, isSameDay, startOfMonth } from "date-fns";

import { useGanttStore } from "../../store/ganttStore";
import { FirstOfTheMonth } from "./FirstOfTheMonth";

export const FirstOfTheMonths = () => {
	const ganttStart = useGanttStore((state) => state.ganttDateStart);
	const ganttEnd = useGanttStore((state) => state.ganttDateEnd);

	const fistOfMonths = getFirstDayOfMonthIndices(ganttStart, ganttEnd);

	return (
		<>
			{fistOfMonths.map((offset) => (
				<FirstOfTheMonth offsetDays={offset} key={offset} />
			))}
		</>
	);
};

const getFirstDayOfMonthIndices = (startDate: Date, endDate: Date): number[] => {
	return eachDayOfInterval({ start: startDate, end: endDate })
		.map((date, index) => ({ date, index }))
		.filter(({ date }) => isSameDay(date, startOfMonth(date)))
		.map(({ index }) => index);
};
