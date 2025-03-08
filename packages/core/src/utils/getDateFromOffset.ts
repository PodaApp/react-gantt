import { addDays } from "date-fns";

interface DateCalculationOptions {
	startsAtZero?: boolean;
}

export const getDateFromOffset = (startDate: Date, pixelOffset: number, pixelsPerDay: number, options: DateCalculationOptions = {}): Date => {
	if (pixelsPerDay <= 0) {
		throw new Error("pixelsPerDay must be greater than zero");
	}

	const { startsAtZero = true } = options;

	const dayOffset = pixelOffset / pixelsPerDay;
	const dayOffsetAdjusted = startsAtZero ? dayOffset : dayOffset - 1;

	return addDays(startDate, Math.ceil(dayOffsetAdjusted));
};
