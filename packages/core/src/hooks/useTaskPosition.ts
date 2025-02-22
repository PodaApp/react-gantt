import { differenceInDays } from "date-fns";

import { useGanttStore } from "../store/ganttStore";
import { getDateFromOffset } from "../utils/getDateFromOffset";
import { getDateRangeFromOffset } from "../utils/getDateRangeFromOffset";
import { getRangeWidth } from "../utils/getRangeWidth";
import { getTaskPosition } from "../utils/getTaskPosition";
import { getWidthFromDays } from "../utils/getWidthFromDays";

export const useTaskPosition = () => {
	const zoomGridWidth = useGanttStore.use.zoomGridWidth();
	const dateStart = useGanttStore.use.ganttDateStart();

	return {
		gridWidth: zoomGridWidth,
		getX: (start: Date) => {
			const rangeOffset = differenceInDays(start, dateStart);
			return getWidthFromDays(rangeOffset, zoomGridWidth);
		},
		getWidthFromDays: (days: number) => getWidthFromDays(days, zoomGridWidth),
		getWidthFromRange: (start: Date, end: Date) => getRangeWidth(start, end, zoomGridWidth),
		getRangeFromOffset: (offset: number, length: number) => getDateRangeFromOffset(offset, length, dateStart, zoomGridWidth),
		getDateFromOffset: (offset: number) => getDateFromOffset(offset, dateStart, zoomGridWidth),
		getTaskPosition: (start: Date, end: Date) => getTaskPosition(dateStart, start, end, zoomGridWidth),
	};
};
