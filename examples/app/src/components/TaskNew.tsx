import { MouseEvent, useCallback, useRef, useState } from "react";

import { GANTT_NEW_TASK_SIZE_DAYS } from "../constants";
import { useGanttStore } from "../store/ganttStore";
import { ITask } from "../types";
import { getDateRangeFromOffset } from "../utils/getDateRangeFromOffset";
import { getOffsetFromDate } from "../utils/getOffsetFromDate";
import { NewTaskPlaceholder } from "./NewTaskPlaceholder";
import "./TaskNew.css";

type Props = {
	taskId?: ITask["id"];
};

export const TaskNew = ({ taskId }: Props) => {
	const taskNewRef = useRef<HTMLDivElement>(null);

	const dateStart = useGanttStore.use.ganttDateStart();

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

			const [start, end] = getDateRangeFromOffset(offsetX, dateStart, GANTT_NEW_TASK_SIZE_DAYS);
			const x = getOffsetFromDate(start, dateStart);

			_setTimelineX(x);
			setDateRangeFocused(start, end);
		},
		[setDateRangeFocused, dateStart],
	);

	const handleMouseLeave = useCallback(() => {
		_setTimelineX(null);
		setDateRangeFocused(null, null);
	}, [setDateRangeFocused]);

	const handleClick = useCallback(() => {
		if (timelineX === null) {
			return;
		}

		const dateRange = getDateRangeFromOffset(timelineX, dateStart, GANTT_NEW_TASK_SIZE_DAYS);

		if (taskId) {
			setTaskRange(taskId, ...dateRange);
		} else {
			taskCreate(...dateRange);
		}
	}, [timelineX, dateStart, taskId, setTaskRange, taskCreate]);

	const showTaskbar = timelineX !== null;

	return (
		<div className="taskNew" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={handleClick} ref={taskNewRef}>
			{showTaskbar && <NewTaskPlaceholder taskId={taskId} />}
		</div>
	);
};
