import { type ReactNode } from "react";

import { add, startOfDay, sub } from "date-fns";

import { tasks as mockTasks } from "../__fixtures__/tasks";
import { DEFAULT_ZOOM, TIMELINE_CONFIG } from "../constants";
import { GanttContext } from "./GanttContext";
import { buildGanttStore } from "./ganttStore";

export type ReactFlowProviderProps = {
	children: ReactNode;
};

export function GanttProvider({ children }: ReactFlowProviderProps) {
	const today = Object.freeze(startOfDay(new Date()));

	const ganttDateCentered = today;
	const ganttDateEnd = add(today, { months: TIMELINE_CONFIG[DEFAULT_ZOOM].monthsPadding });
	const ganttDateStart = sub(today, { months: TIMELINE_CONFIG[DEFAULT_ZOOM].monthsPadding });
	const tasks = mockTasks;

	const store = buildGanttStore({ ganttDateCentered, ganttDateEnd, ganttDateStart, tasks });

	return <GanttContext.Provider value={store}>{children}</GanttContext.Provider>;
}
