import { addDays } from "date-fns";

import { GRID_WIDTH } from "../constants";

export const getDateFromOffset = (offset: number, dateStart: Date) => {
	const daysFromStart = offset / GRID_WIDTH;
	return addDays(dateStart, daysFromStart);
};
