import { addDays } from "date-fns";

import { getDateFromOffset } from "./getDateFromOffset";

export const getDateRangeFromOffset = (offset: number, dateStart: Date, length: number): [Date, Date] => {
	const start = getDateFromOffset(offset, dateStart);
	const end = addDays(start, length - 1);

	return [start, end];
};
