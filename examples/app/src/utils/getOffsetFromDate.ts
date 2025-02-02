import { differenceInDays } from "date-fns";

import { COL_WIDTH } from "../constants";

export const getOffsetFromDate = (taskStart: string, ganttStart: number): number => {
	// TODO: Need to understand this out by 1 error
	const difference = differenceInDays(taskStart, ganttStart) + 1;
	return difference * COL_WIDTH;
};
