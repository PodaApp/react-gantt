import { differenceInDays } from "date-fns";

import { GRID_WIDTH } from "../constants";
import { ITaskOffset, ITaskWithDate } from "../types";

export const getTaskPosition = (ganttStart: Date, task: ITaskWithDate): ITaskOffset => {
	const rangeOffset = differenceInDays(task.start, ganttStart) + 1;
	const rangeLength = differenceInDays(task.end, task.start) + 1;

	return { width: rangeLength * GRID_WIDTH, x: rangeOffset * GRID_WIDTH };
};
