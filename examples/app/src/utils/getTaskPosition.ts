import { differenceInDays } from "date-fns";

import { ITaskOffset } from "../types";
import { getOffsetFromDate } from "./getOffsetFromDate";
import { getWidthFromDays } from "./getWidthFromDays";

export const getTaskPosition = (ganttStart: Date, start: Date, end: Date, gridWidth: number): ITaskOffset => {
	const rangeLength = differenceInDays(end, start) + 1;

	return { width: getWidthFromDays(rangeLength, gridWidth), x: getOffsetFromDate(start, ganttStart, gridWidth) };
};
