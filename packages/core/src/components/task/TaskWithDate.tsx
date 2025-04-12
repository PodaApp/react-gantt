import { RefObject } from "react";

import { ITaskWithDate } from "../../types/tasks";
import { TaskContent } from "./TaskContent";
import { TaskDraggable } from "./TaskDraggable";
import { TimelineBar } from "./TimelineBar";

import "./TaskWithDate.css";

type Props = {
	task: ITaskWithDate;
	activeIndex: number | null;
	containerRef: RefObject<HTMLDivElement>;
};

export const TaskWithDate = ({ task, containerRef }: Props) => {
	return (
		<TimelineBar className="taskWithDate__bar" start={task.start} end={task.end}>
			<TaskDraggable task={task}>
				<TaskContent task={task} containerRef={containerRef} />
			</TaskDraggable>
		</TimelineBar>
	);
};
