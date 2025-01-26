import { useCallback, useMemo, useRef, useState } from "react";

import { tasks as mockTasks } from "./__fixtures__/tasks";
import { setTaskFocusedCommand } from "./commands/setTaskFocusedCommand";
import { Header } from "./components/Header";
import { Tasks } from "./components/Tasks";
import "./Gantt.css";
import { getTaskFocusedQuery } from "./queries/getTaskFocusedQuery";
import { ITask } from "./types";

function Gantt() {
	const elTimeline = useRef<HTMLDivElement>(null);
	const [tasks, setTasks] = useState<ITask[]>(mockTasks);

	const focusedTask = useMemo(() => getTaskFocusedQuery(tasks), [tasks]);

	const onTaskHover = useCallback((node: ITask) => {
		setTasks(setTaskFocusedCommand(node.id));
	}, []);

	return (
		<div className="gantt">
			<div className="gantt__scrollable" ref={elTimeline}>
				<Header focusedTask={focusedTask} containerRef={elTimeline} />
				<Tasks tasks={tasks} containerRef={elTimeline} onTaskHover={onTaskHover} />
			</div>
			<div>Sticky Footer</div>
		</div>
	);
}

export default Gantt;
