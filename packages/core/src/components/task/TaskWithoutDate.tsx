import { MouseEvent, useCallback, useRef } from "react";

import { TASK_ID_UNCOMMITED } from "../../constants";
import { useGanttStore } from "../../store/ganttStore";
import { ITask } from "../../types";
import { NewTaskPlaceholder } from "./NewTaskPlaceholder";

import "./TaskWithoutDate.css";

type Props = {
	task?: ITask;
};

export const TaskWithoutDate = ({ task }: Props) => {
	const taskNewRef = useRef<HTMLDivElement>(null);

	const taskId = task?.id || TASK_ID_UNCOMMITED;

	const scheduleTask = useGanttStore.use.scheduleTask();
	const scheduleTaskClear = useGanttStore.use.scheduleTaskClear();
	const scheduleTaskConfirm = useGanttStore.use.scheduleTaskConfirm();

	const handleMouseMove = useCallback(
		(event: MouseEvent<HTMLDivElement>) => {
			if (taskNewRef.current) {
				const rectTask = taskNewRef.current.getBoundingClientRect();
				const offsetX = event.clientX - rectTask.left;

				scheduleTask(taskId, offsetX);
			}
		},
		[scheduleTask, taskId],
	);

	const handleMouseLeave = useCallback(() => {
		scheduleTaskClear();
	}, [scheduleTaskClear]);

	const handleClick = useCallback(() => {
		scheduleTaskConfirm(taskId);
	}, [scheduleTaskConfirm, taskId]);

	if (task && task.creating) {
		return null;
	}

	return (
		<div className="taskWithoutDate" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={handleClick} ref={taskNewRef}>
			<NewTaskPlaceholder taskId={taskId} />
		</div>
	);
};
