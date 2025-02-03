import { addDays } from "date-fns";

import { COL_WIDTH } from "../constants";

export const getDateFromOffset = (offset: number, dateStart: number): string => {
	const daysFromStart = offset / COL_WIDTH;
	return addDays(dateStart, daysFromStart).toDateString();
};
