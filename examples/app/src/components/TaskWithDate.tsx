import { RefObject } from "react";

import { useGanttStore } from "../store/ganttStore";
import { ITaskWithDate } from "../types";
import { getTaskPosition } from "../utils/getTaskPosition";
import { TaskContent } from "./TaskContent";
import { TaskDraggable } from "./TaskDraggable";
import "./TaskWithDate.css";

type Props = {
	task: ITaskWithDate;
	activeIndex: number | null;
	containerRef: RefObject<HTMLDivElement>;
};

export const TaskWithDate = ({ task, containerRef }: Props) => {
	const dateStart = useGanttStore.use.ganttDateStart();

	const taskPosition = getTaskPosition(dateStart, task);

	const taskbarInlinePosition = {
		"--task-width": `${taskPosition.width}px`,
		"--task-x": `${taskPosition.x}px`,
	} as React.CSSProperties;

	return (
		<div className="taskWithDate__bar" style={taskbarInlinePosition}>
			<TaskDraggable task={task} position={taskPosition}>
				<TaskContent task={task} containerRef={containerRef} />
			</TaskDraggable>
		</div>
	);
};
