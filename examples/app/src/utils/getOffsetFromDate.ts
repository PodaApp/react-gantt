import { differenceInDays } from "date-fns";

import { GRID_WIDTH } from "../constants";

export const getOffsetFromDate = (taskStart: Date, ganttStart: Date): number => {
	const difference = differenceInDays(taskStart, ganttStart);
	return difference * GRID_WIDTH;
};
