import { add, startOfDay, sub } from "date-fns";

import { DEFAULT_ZOOM, TIMELINE_CONFIG } from "../constants";
import { GanttProps } from "../types/componentProps";
import { ITask } from "../types/tasks";
import { GanttContext } from "./GanttContext";
import { buildGanttStore } from "./ganttStore";

type GanttProviderProps<TaskType extends ITask = ITask> = Pick<
	GanttProps<TaskType>,
	"dateFormatLong" | "dateFormatShort" | "tasks" | "timelineDateCentered" | "timelineJumpToPaddingDays" | "timelineZoomConfig"
> & {
	children: React.ReactNode;
};

export function GanttProvider(props: GanttProviderProps) {
	const { timelineDateCentered, tasks = [], children } = props;

	const dateCentered = Object.freeze(timelineDateCentered || startOfDay(new Date()));
	const ganttDateEnd = add(dateCentered, { months: TIMELINE_CONFIG[DEFAULT_ZOOM].monthsPadding });
	const ganttDateStart = sub(dateCentered, { months: TIMELINE_CONFIG[DEFAULT_ZOOM].monthsPadding });

	const store = buildGanttStore({ timelineDateCentered: dateCentered, ganttDateEnd, ganttDateStart, tasks });

	return <GanttContext.Provider value={store}>{children}</GanttContext.Provider>;
}
