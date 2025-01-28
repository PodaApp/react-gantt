import { Month } from "date-fns";
import { enUS } from "date-fns/locale";

type Args = { startDate: number; endDate: number };
export type GanttData = { month: string; year: number; weeks: string[]; startOnDay: number }[];
type GetMonths = (args: Args) => GanttData;

// TODO: Review this was GPT'd
const getMonths: GetMonths = ({ startDate, endDate }) => {
	const start = new Date(startDate);
	const end = new Date(endDate);
	const months = [];

	while (start <= end) {
		// Calculate the first and last day of the current month
		const firstDayOfMonth = new Date(start.getFullYear(), start.getMonth(), 1);
		const lastDayOfMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0);

		// Adjust the start and end days for this month
		const iterationStartDate = start.getTime() > firstDayOfMonth.getTime() ? start : firstDayOfMonth;
		const iterationEndDate = end.getTime() < lastDayOfMonth.getTime() ? end : lastDayOfMonth;

		// Generate days for the current month, bounded by the adjusted start and end dates
		const daysInMonth = [];
		for (let day = iterationStartDate.getDate(); day <= iterationEndDate.getDate(); day++) {
			daysInMonth.push(new Date(start.getFullYear(), start.getMonth(), day).toString());
		}

		months.push({
			month: enUS.localize.month(start.getMonth() as Month, { width: "wide" }),
			year: start.getFullYear(),
			weeks: daysInMonth,
			startOnDay: new Date(start.getFullYear(), start.getMonth(), 1).getDay(),
		});

		// Move to the next month
		start.setMonth(start.getMonth() + 1);
		start.setDate(1); // Ensure the date is reset to the first of the next month
	}

	return months;
};

export const useCalendar = ({ startDate, endDate }: Args) => {
	return getMonths({ startDate, endDate });
};
