import { MouseEvent, useCallback, useRef } from "react";

import { TASK_ID_UNCOMMITED } from "../../constants";
import { useGanttStore } from "../../hooks/useGanttStore";
import { ITask } from "../../types";
import { NewTaskPlaceholder } from "./NewTaskPlaceholder";

import "./TaskWithoutDate.css";

type Props = {
	task?: ITask;
};

export const TaskWithoutDate = ({ task }: Props) => {
	const taskNewRef = useRef<HTMLDivElement>(null);

	const taskId = task?.id || TASK_ID_UNCOMMITED;

	const scheduleTask = useGanttStore((state) => state.scheduleTask);
	const scheduleTaskClear = useGanttStore((state) => state.scheduleTaskClear);
	const scheduleTaskConfirm = useGanttStore((state) => state.scheduleTaskConfirm);

	const isEditingTask = useGanttStore((state) => state.taskEditingId !== null);
	const isTaskCreating = task && task.creating;

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

	if (isTaskCreating || isEditingTask) {
		return null;
	}

	return (
		<div className="taskWithoutDate" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={handleClick} ref={taskNewRef}>
			<NewTaskPlaceholder taskId={taskId} />
		</div>
	);
};
