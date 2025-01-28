import { GanttStoreState } from "../store/ganttStore";
import { ITask } from "../types";

export const getTaskFocusedQuery = (s: GanttStoreState): ITask | null => {
	return s.tasks.find((task) => task.focused) || null;
};
