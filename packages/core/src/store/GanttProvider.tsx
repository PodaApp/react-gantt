import { type ReactNode } from "react";

import { add, startOfDay, sub } from "date-fns";

import { DEFAULT_ZOOM, TIMELINE_CONFIG } from "../constants";
import { GanttContext } from "./GanttContext";
import { buildGanttStore } from "./ganttStore";

type GanttProviderProps = {
	dateCentered?: any;
	tasks?: any;
	children: ReactNode;
};

export function GanttProvider(props: GanttProviderProps) {
	const { dateCentered, tasks = [], children } = props;

	const ganttDateCentered = Object.freeze(dateCentered || startOfDay(new Date()));
	const ganttDateEnd = add(ganttDateCentered, { months: TIMELINE_CONFIG[DEFAULT_ZOOM].monthsPadding });
	const ganttDateStart = sub(ganttDateCentered, { months: TIMELINE_CONFIG[DEFAULT_ZOOM].monthsPadding });

	const store = buildGanttStore({ ganttDateCentered, ganttDateEnd, ganttDateStart, tasks });

	return <GanttContext.Provider value={store}>{children}</GanttContext.Provider>;
}
