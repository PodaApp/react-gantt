import { differenceInDays } from "date-fns";

import { getWidthFromDays } from "./getWidthFromDays";

export const getRangeWidth = (start: Date, end: Date) => {
	return getWidthFromDays(differenceInDays(end, start) + 1);
};
