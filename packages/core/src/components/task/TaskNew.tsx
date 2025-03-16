import { MouseEvent, useCallback, useRef, useState } from "react";

import { TIMELINE_CONFIG } from "../../constants";
import { useGanttStore } from "../../hooks/useGanttStore";
import { useTaskPosition } from "../../hooks/useTaskPosition";
import { ITask } from "../../types";
import { NewTaskPlaceholder } from "./NewTaskPlaceholder";

import "./TaskNew.css";

type Props = {
	taskId?: ITask["id"];
};

export const TaskNew = ({ taskId }: Props) => {
	const taskNewRef = useRef<HTMLDivElement>(null);

	const { getRangeFromOffset, getX } = useTaskPosition();

	const taskCreate = useGanttStore((state) => state.taskCreate);
	const setDateRangeFocused = useGanttStore((state) => state.setHeaderTaskRange);
	const setTaskRange = useGanttStore((state) => state.setTaskRange);
	const zoom = useGanttStore((state) => state.zoom);

	const taskSize = TIMELINE_CONFIG[zoom].defaultTaskSizeDays;

	const [timelineX, _setTimelineX] = useState<number | null>(null);

	const handleMouseMove = useCallback(
		(event: MouseEvent<HTMLDivElement>) => {
			if (!taskNewRef.current) {
				return;
			}

			const rectTask = taskNewRef.current.getBoundingClientRect();
			const offsetX = event.clientX - rectTask.left;

			const [start, end] = getRangeFromOffset(offsetX, taskSize);
			const x = getX(start, false);

			_setTimelineX(x);
			setDateRangeFocused(start, end);
		},
		[getRangeFromOffset, getX, setDateRangeFocused, taskSize],
	);

	const handleMouseLeave = useCallback(() => {
		_setTimelineX(null);
		setDateRangeFocused(null, null);
	}, [setDateRangeFocused]);

	const handleClick = useCallback(() => {
		if (timelineX === null) {
			return;
		}

		const dateRange = getRangeFromOffset(timelineX, taskSize);

		if (taskId) {
			setTaskRange(taskId, ...dateRange);
		} else {
			taskCreate(...dateRange);
		}
	}, [timelineX, getRangeFromOffset, taskSize, taskId, setTaskRange, taskCreate]);

	const showTaskbar = timelineX !== null;

	return (
		<div className="taskNew" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={handleClick} ref={taskNewRef}>
			{showTaskbar && <NewTaskPlaceholder taskId={taskId} />}
		</div>
	);
};
