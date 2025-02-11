import { MouseEvent, useCallback, useRef } from "react";

import { useGanttStore } from "../store/ganttStore";
import { ITask } from "../types";
import "./NewTask.css";
import { NewTaskPlaceholder } from "./NewTaskPlaceholder";

type Props = {
	taskId?: ITask["id"];
};

export const NewTask = ({ taskId }: Props) => {
	const taskNewRef = useRef<HTMLDivElement>(null);

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

	return (
		<div className="newTask" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={handleClick} ref={taskNewRef}>
			<NewTaskPlaceholder taskId={taskId} />
		</div>
	);
};
