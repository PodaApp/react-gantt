import { differenceInDays } from "date-fns";

import { getDateFromOffset } from "../utils/getDateFromOffset";
import { getDateRangeFromOffset } from "../utils/getDateRangeFromOffset";
import { getRangeWidth } from "../utils/getRangeWidth";
import { getTaskPosition } from "../utils/getTaskPosition";
import { getWidthFromDays } from "../utils/getWidthFromDays";
import { useGanttStore } from "./useGanttStore";

// TODO: Review this closely, remove boolean agruments consider argument order etc
export const useTaskPosition = () => {
	const zoomGridWidth = useGanttStore((state) => state.zoomGridWidth);
	const dateStart = useGanttStore((state) => state.ganttDateStart);

	return {
		gridWidth: zoomGridWidth,
		getX: (start: Date, inclusive: boolean) => {
			const mod = inclusive ? 0 : 1;
			const rangeOffset = differenceInDays(start, dateStart) + mod;
			return getWidthFromDays(rangeOffset, zoomGridWidth);
		},
		getWidthFromDays: (days: number) => getWidthFromDays(days, zoomGridWidth),
		getWidthFromRange: (start: Date, end: Date) => getRangeWidth(start, end, zoomGridWidth),
		getRangeFromOffset: (offset: number, length: number) => getDateRangeFromOffset(offset, length, dateStart, zoomGridWidth),
		getDateFromOffset: (offset: number, startsAtZero?: boolean) => getDateFromOffset(dateStart, offset, zoomGridWidth, { startsAtZero }),
		getTaskPosition: (start: Date, end: Date, inclusive: boolean) => getTaskPosition(dateStart, start, end, zoomGridWidth, inclusive),
	};
};
