import { differenceInDays } from "date-fns";

import { GRID_WIDTH } from "../constants";
import { ITaskOffset } from "../types";

export const getTaskPosition = (ganttStart: Date, start: Date, end: Date): ITaskOffset => {
	const rangeOffset = differenceInDays(start, ganttStart);
	const rangeLength = differenceInDays(end, start) + 1;

	return { width: rangeLength * GRID_WIDTH, x: rangeOffset * GRID_WIDTH };
};
