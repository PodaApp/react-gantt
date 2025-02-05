import { differenceInDays } from "date-fns";

import { COL_WIDTH } from "../constants";
import { ITask, ITaskOffset } from "../types";

export const getTaskPosition = (ganttStart: number, task: ITask): ITaskOffset => {
	const rangeOffset = differenceInDays(task.start, new Date(ganttStart).toISOString()) + 1;
	const rangeLength = differenceInDays(task.end, task.start) + 1;

	return { width: rangeLength * COL_WIDTH, x: rangeOffset * COL_WIDTH };
};
