import { RefObject } from "react";

import { ITask, ITaskWithDate } from "../types";
import "./Task.css";
import { TaskNew } from "./TaskNew";
import { TaskWithDate } from "./TaskWithDate";

type Props = {
	task: ITask;
	activeIndex: number;
	containerRef: RefObject<HTMLDivElement>;
};

export const Task = ({ task, activeIndex, containerRef }: Props) => {
	const isOnTimeline = task.start !== null && task.end !== null;

	if (isOnTimeline) {
		return (
			<div className="task">
				<TaskWithDate task={task as ITaskWithDate} activeIndex={activeIndex} containerRef={containerRef} />
			</div>
		);
	}

	return <div className="task">{!task.creating && <TaskNew taskId={task.id} containerRef={containerRef} />}</div>;
};
