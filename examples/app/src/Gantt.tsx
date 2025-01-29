import { useEffect, useRef } from "react";

import { tasks as mockTasks } from "./__fixtures__/tasks";
import { Header } from "./components/Header";
import { Tasks } from "./components/Tasks";
import "./Gantt.css";
import { getGanttCurrentOffset } from "./queries/getGanttCurrentOffset";
import { useGanttStore } from "./store/ganttStore";

function Gantt() {
	const elTimeline = useRef<HTMLDivElement>(null);

	const setGantt = useGanttStore.use.setGantt();
	const setTasks = useGanttStore.use.setTasks();

	useEffect(() => {
		setGantt(Date.now());
		setTasks(mockTasks);
	}, [setGantt, setTasks]);

	const ganttCurrentOffset = useGanttStore(getGanttCurrentOffset);

	useEffect(() => {
		if (elTimeline.current) {
			elTimeline.current.scrollLeft = ganttCurrentOffset - elTimeline.current.offsetWidth / 2;
		}
	}, [ganttCurrentOffset]);

	return (
		<div className="gantt">
			<div className="gantt__scrollable" ref={elTimeline}>
				<div className="gantt__wrapper">
					<Header containerRef={elTimeline} />
					<Tasks containerRef={elTimeline} />
				</div>
			</div>
		</div>
	);
}

export default Gantt;
