import { useEffect, useLayoutEffect, useRef } from "react";

import { getGanttCurrentOffset } from "../queries/getGanttCurrentOffset";
import { useGanttStore } from "../store/ganttStore";
import { Header } from "./header/Header";
import { TaskTable } from "./taskTable/TaskTable";
import { TasksTimeline } from "./timeline/TasksTimeline";
import { TasksTimelineNewTask } from "./timeline/TasksTimelineNewTask";

import "./Gantt.css";

function Gantt() {
	const elTimeline = useRef<HTMLDivElement>(null);

	const taskTableOpen = useGanttStore.use.ganttTaskListOpen();
	const ganttDateCentered = useGanttStore.use.ganttDateCentered();
	const ganttCurrentOffset = useGanttStore(getGanttCurrentOffset);
	const clearTaskFocused = useGanttStore.use.clearTaskFocused();

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
		<div className="gantt">
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
}

export default Gantt;
