import { addDays } from "date-fns";

import { COL_WIDTH } from "../constants";

export const getDateFromOffset = (offset: number, dateStart: number): string => {
	// TODO: Understand out by 1 condition
	const daysFromStart = offset / COL_WIDTH - 1;
	return addDays(dateStart, daysFromStart).toDateString();
};
