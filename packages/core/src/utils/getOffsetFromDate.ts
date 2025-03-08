import { differenceInDays } from "date-fns";

import { getWidthFromDays } from "./getWidthFromDays";

export const getOffsetFromDate = (taskStart: Date, ganttStart: Date, gridWidth: number, inclusive: boolean): number => {
	const mod = inclusive ? 1 : 0;
	const daysToDate = differenceInDays(taskStart, ganttStart) + mod;
	return getWidthFromDays(daysToDate, gridWidth);
};
