import { useEffect, useRef } from "react";

import { tasks as mockTasks } from "./__fixtures__/tasks";
import { Header } from "./components/Header";
import { Tasks } from "./components/Tasks";
import "./Gantt.css";
import { getGanttCurrentOffset } from "./queries/getGanttCurrentOffset";
import { getTaskFocusedQuery } from "./queries/getTaskFocusedQuery";
import { useGanttStore } from "./store/ganttStore";

function Gantt() {
	const elTimeline = useRef<HTMLDivElement>(null);

	const setGantt = useGanttStore.use.setGantt();
	const setTasks = useGanttStore.use.setTasks();
	const setFocusedTask = useGanttStore.use.setTaskFocused();

	useEffect(() => {
		setGantt(Date.now());
		setTasks(mockTasks);
	}, [setGantt, setTasks]);

	const tasks = useGanttStore.use.tasks();
	const dateEnd = useGanttStore.use.dateEnd();
	const dateStart = useGanttStore.use.dateStart();

	const ganttCurrentOffset = useGanttStore(getGanttCurrentOffset);
	const focusedTask = useGanttStore(getTaskFocusedQuery);

	useEffect(() => {
		if (elTimeline.current) {
			elTimeline.current.scrollLeft = ganttCurrentOffset - elTimeline.current.offsetWidth / 2;
		}
	}, [ganttCurrentOffset]);

	return (
		<div className="gantt">
			<div className="gantt__scrollable" ref={elTimeline}>
				<Header startDate={dateStart} endDate={dateEnd} focusedTask={focusedTask} containerRef={elTimeline} />
				<Tasks startDate={dateStart} tasks={tasks} containerRef={elTimeline} onTaskHover={setFocusedTask} />
			</div>
			<div>Sticky Footer</div>
		</div>
	);
}

export default Gantt;
