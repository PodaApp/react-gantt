import { GanttStoreState } from "../store/ganttStore";
import { getOffsetFromDate } from "../utils/getOffsetFromDate";

export const getGanttCurrentOffset = (store: GanttStoreState) => {
	const { ganttDateCentered: gantDateCentered, ganttDateStart, zoomGridWidth } = store;
	return getOffsetFromDate(gantDateCentered, ganttDateStart, zoomGridWidth);
};
