import { MouseEvent, useCallback, useRef } from "react";

import { useGanttStore } from "../store/ganttStore";
import { ITask } from "../types";
import { NewTaskPlaceholder } from "./NewTaskPlaceholder";
import "./TaskWithoutDate.css";

type Props = {
	task?: ITask;
};

export const TaskWithoutDate = ({ task }: Props) => {
	const taskNewRef = useRef<HTMLDivElement>(null);

	const scheduleTask = useGanttStore.use.scheduleTask();
	const scheduleTaskClear = useGanttStore.use.scheduleTaskClear();
	const scheduleTaskConfirm = useGanttStore.use.scheduleTaskConfirm();

	const handleMouseMove = useCallback(
		(event: MouseEvent<HTMLDivElement>) => {
			if (taskNewRef.current) {
				const rectTask = taskNewRef.current.getBoundingClientRect();
				const offsetX = event.clientX - rectTask.left;

				scheduleTask(task?.id, offsetX);
			}
		},
		[scheduleTask, task?.id],
	);

	const handleMouseLeave = useCallback(() => {
		scheduleTaskClear();
	}, [scheduleTaskClear]);

	const handleClick = useCallback(() => {
		scheduleTaskConfirm(task?.id);
	}, [scheduleTaskConfirm, task?.id]);

	if (task && task.creating) {
		return null;
	}

	return (
		<div className="taskWithoutDate" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={handleClick} ref={taskNewRef}>
			<NewTaskPlaceholder taskId={task?.id} />
		</div>
	);
};
