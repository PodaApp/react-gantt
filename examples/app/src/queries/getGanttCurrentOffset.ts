import { GanttStoreState } from "../store/ganttStore";
import { getOffsetFromDate } from "../utils/getOffsetFromDate";

export const getGanttCurrentOffset = (store: GanttStoreState) => {
	const { gantDateCentered, ganttDateStart } = store;
	return getOffsetFromDate(gantDateCentered, ganttDateStart);
};
