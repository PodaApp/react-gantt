import { differenceInDays } from "date-fns";

import { ITaskOffset } from "../types";
import { getOffsetFromDate } from "./getOffsetFromDate";
import { getWidthFromDays } from "./getWidthFromDays";

export const getTaskPosition = (ganttStart: Date, start: Date, end: Date, gridWidth: number, inclusive: boolean): ITaskOffset => {
	// Length calculation should always be inclusive
	const rangeLength = differenceInDays(end, start) + 1;

	const width = getWidthFromDays(rangeLength, gridWidth);

	if (width >= 160) {
		console.log("w160", start.getTime(), end.getTime(), differenceInDays(end, start), rangeLength, rangeLength * gridWidth);
	}

	return { width: getWidthFromDays(rangeLength, gridWidth), x: getOffsetFromDate(start, ganttStart, gridWidth, inclusive) };
};
