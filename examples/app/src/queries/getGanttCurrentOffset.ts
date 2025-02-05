import { differenceInDays } from "date-fns";

import { GRID_WIDTH } from "../constants";
import { GanttStoreState } from "../store/ganttStore";

export const getGanttCurrentOffset = (store: GanttStoreState) => {
	const daysToCurrent = differenceInDays(store.dateCentered, store.dateStart) + 1;
	return daysToCurrent * GRID_WIDTH;
};
