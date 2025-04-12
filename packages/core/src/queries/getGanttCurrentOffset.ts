import { GanttStoreState } from "../store/ganttStore";
import { getOffsetFromDate } from "../utils/getOffsetFromDate";

export const getGanttCurrentOffset = (store: GanttStoreState) => {
	const { timelineDateCentered, ganttDateStart, zoomGridWidth } = store;
	return getOffsetFromDate(timelineDateCentered, ganttDateStart, zoomGridWidth, false);
};
