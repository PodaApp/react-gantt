import { addDays } from "date-fns";

import { getDateFromOffset } from "./getDateFromOffset";

export const getDateRangeFromOffset = (offset: number, length: number, dateStart: Date, gridWidth: number): [Date, Date] => {
	const start = getDateFromOffset(dateStart, offset, gridWidth, { startsAtZero: false });
	const end = addDays(start, length);

	return [start, end];
};
