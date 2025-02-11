import { useLayoutEffect, useRef } from "react";

import { Header } from "./components/Header";
import { TasksTimeline } from "./components/TasksTimeline";
import { TasksTimelineNewTask } from "./components/TasksTimelineNewTask";
import { TaskTable } from "./components/TaskTable";
import "./Gantt.css";
import { getGanttCurrentOffset } from "./queries/getGanttCurrentOffset";
import { useGanttStore } from "./store/ganttStore";

function Gantt() {
	const elTimeline = useRef<HTMLDivElement>(null);

	const taskTableOpen = useGanttStore.use.ganttTaskListOpen();

	const ganttCurrentOffset = useGanttStore(getGanttCurrentOffset);

	useLayoutEffect(() => {
		if (elTimeline.current) {
			elTimeline.current.scrollLeft = ganttCurrentOffset - elTimeline.current.offsetWidth / 2;
		}
	}, [ganttCurrentOffset]);

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
