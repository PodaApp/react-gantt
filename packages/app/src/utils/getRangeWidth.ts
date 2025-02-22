import { differenceInDays } from "date-fns";

import { getWidthFromDays } from "./getWidthFromDays";

export const getRangeWidth = (start: Date, end: Date, zoomGridWidth: number) => {
	return getWidthFromDays(differenceInDays(end, start) + 1, zoomGridWidth);
};
