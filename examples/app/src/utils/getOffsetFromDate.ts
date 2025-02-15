import { differenceInDays } from "date-fns";

import { getWidthFromDays } from "./getWidthFromDays";

export const getOffsetFromDate = (taskStart: Date, ganttStart: Date): number => {
	const daysToDate = differenceInDays(taskStart, ganttStart);
	return getWidthFromDays(daysToDate);
};
