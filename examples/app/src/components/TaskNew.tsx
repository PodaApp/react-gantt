import { MouseEvent, useCallback, useRef, useState } from "react";

import { GANTT_NEW_TASK_SIZE_DAYS } from "../constants";
import { useTaskPosition } from "../hooks/useTaskPosition";
import { useGanttStore } from "../store/ganttStore";
import { ITask } from "../types";
import { NewTaskPlaceholder } from "./NewTaskPlaceholder";
import "./TaskNew.css";

type Props = {
	taskId?: ITask["id"];
};

export const TaskNew = ({ taskId }: Props) => {
	const taskNewRef = useRef<HTMLDivElement>(null);

	const { getRangeFromOffset, getX } = useTaskPosition();

	const taskCreate = useGanttStore.use.taskCreate();
	const setDateRangeFocused = useGanttStore.use.setHeaderTaskRange();
	const setTaskRange = useGanttStore.use.setTaskRange();

	const [timelineX, _setTimelineX] = useState<number | null>(null);

	const handleMouseMove = useCallback(
		(event: MouseEvent<HTMLDivElement>) => {
			if (!taskNewRef.current) {
				return;
			}

			const rectTask = taskNewRef.current.getBoundingClientRect();
			const offsetX = event.clientX - rectTask.left;

			const [start, end] = getRangeFromOffset(offsetX, GANTT_NEW_TASK_SIZE_DAYS);
			const x = getX(start);

			_setTimelineX(x);
			setDateRangeFocused(start, end);
		},
		[getRangeFromOffset, getX, setDateRangeFocused],
	);

	const handleMouseLeave = useCallback(() => {
		_setTimelineX(null);
		setDateRangeFocused(null, null);
	}, [setDateRangeFocused]);

	const handleClick = useCallback(() => {
		if (timelineX === null) {
			return;
		}

		const dateRange = getRangeFromOffset(timelineX, GANTT_NEW_TASK_SIZE_DAYS);

		if (taskId) {
			setTaskRange(taskId, ...dateRange);
		} else {
			taskCreate(...dateRange);
		}
	}, [timelineX, getRangeFromOffset, taskId, setTaskRange, taskCreate]);

	const showTaskbar = timelineX !== null;

	return (
		<div className="taskNew" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={handleClick} ref={taskNewRef}>
			{showTaskbar && <NewTaskPlaceholder taskId={taskId} />}
		</div>
	);
};
