import { addDays } from "date-fns";

export const getDateFromOffset = (offset: number, dateStart: Date, zoomGridWidth: number) => {
	const daysFromStart = offset / zoomGridWidth;
	return addDays(dateStart, daysFromStart);
};
