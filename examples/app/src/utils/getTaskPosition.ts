import { differenceInDays } from "date-fns";

import { ITaskOffset } from "../types";
import { getWidthFromDays } from "./getWidthFromDays";

export const getTaskPosition = (ganttStart: Date, start: Date, end: Date): ITaskOffset => {
	const rangeOffset = differenceInDays(start, ganttStart);
	const rangeLength = differenceInDays(end, start) + 1;

	return { width: getWidthFromDays(rangeLength), x: getWidthFromDays(rangeOffset) };
};
