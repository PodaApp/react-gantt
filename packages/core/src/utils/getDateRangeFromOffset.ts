import { addDays } from "date-fns";

import { getDateFromOffset } from "./getDateFromOffset";

export const getDateRangeFromOffset = (offset: number, length: number, dateStart: Date, gridWidth: number): [Date, Date] => {
	const start = getDateFromOffset(offset, dateStart, gridWidth);
	const end = addDays(start, length - 1);

	return [start, end];
};
