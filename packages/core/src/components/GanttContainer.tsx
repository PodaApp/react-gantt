import { useEffect, useLayoutEffect, useRef } from "react";

import { useGanttStore } from "../hooks/useGanttStore";
import { getGanttCurrentOffset } from "../queries/getGanttCurrentOffset";
import { Header } from "./header/Header";
import { TaskTable } from "./taskTable/TaskTable";
import { TasksTimeline } from "./timeline/TasksTimeline";
import { TasksTimelineNewTask } from "./timeline/TasksTimelineNewTask";

import "./GanttContainer.css";

export const GanttContainer = () => {
	const elTimeline = useRef<HTMLDivElement>(null);

	const taskTableOpen = useGanttStore((state) => state.ganttTaskListOpen);
	const ganttDateStart = useGanttStore((state) => state.ganttDateStart);
	const ganttDateCentered = useGanttStore((state) => state.timelineDateCentered);
	const ganttDateEnd = useGanttStore((state) => state.ganttDateEnd);
	const ganttCurrentOffset = useGanttStore(getGanttCurrentOffset);
	const clearTaskFocused = useGanttStore((state) => state.clearTaskFocused);

	useEffect(() => {
		document.addEventListener("click", clearTaskFocused);

		return () => {
			document.removeEventListener("click", clearTaskFocused);
		};
	}, [clearTaskFocused]);

	/**
	 * Requires ganttDateCentered to be a new instance of date, otherwise it will not trigger the useEffect
	 * if the centered date hasn't changed. Currently, the ganttDateCentered is only changed when the zoom
	 * is updated.
	 */
	useLayoutEffect(() => {
		if (elTimeline.current) {
			elTimeline.current.scrollLeft = ganttCurrentOffset - elTimeline.current.offsetWidth / 2;
		}
	}, [elTimeline, ganttCurrentOffset, ganttDateCentered]);

	return (
		<div
			className="gantt"
			data-testid="ganttContainer"
			data-start={ganttDateStart.toISOString()}
			data-centered={ganttDateCentered.toISOString()}
			data-end={ganttDateEnd.toISOString()}>
			{taskTableOpen && (
				<div className="gantt__tasksTable">
					<TaskTable />
				</div>
			)}
			<div className="gantt__scrollableContainer">
				<div className="gantt__scrollable" ref={elTimeline}>
					<div className="gantt__wrapper">
						<Header containerRef={elTimeline} />
						<TasksTimeline containerRef={elTimeline} />
					</div>
					<div className="gantt__newTask">
						<TasksTimelineNewTask />
					</div>
				</div>
			</div>
		</div>
	);
};
