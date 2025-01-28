import { differenceInDays } from "date-fns";

import { COL_WIDTH } from "../constants";
import { GanttStoreState } from "../store/ganttStore";

export const getGanttCurrentOffset = (s: GanttStoreState) => {
	const daysToCurrent = differenceInDays(s.dateCentered, s.dateStart) + 1;
	return daysToCurrent * COL_WIDTH;
};
