import { MouseEvent, RefObject, useCallback, useRef, useState } from "react";

import { addDays } from "date-fns";
import { createPortal } from "react-dom";

import { GANTT_NEW_TASK_SIZE_DAYS, GRID_WIDTH } from "../constants";
import { useGanttStore } from "../store/ganttStore";
import { ITask } from "../types";
import { getDateFromOffset } from "../utils/getDateFromOffset";
import { ButtonTaskNew } from "./ButtonTaskNew";
import "./TaskNew.css";

type Props = {
	taskId?: ITask["id"];
	containerRef: RefObject<HTMLDivElement>;
};

const mockWidth = GANTT_NEW_TASK_SIZE_DAYS * GRID_WIDTH;

// TODO: There is a bug where all empty tasks show up when you hover over the new button
export const TaskNew = ({ taskId, containerRef }: Props) => {
	const taskNewRef = useRef<HTMLDivElement>(null);

	const dateStart = useGanttStore.use.dateStart();

	const clearDateRangeFocused = useGanttStore.use.clearDateRangeFocused();
	const createTask = useGanttStore.use.createTask();
	const setDateRangeFocused = useGanttStore.use.setDateRangeFocused();
	const setTaskRange = useGanttStore.use.setTaskRange();

	const [timelineX, setTimelineX] = useState(0);

	const handleMouseMove = useCallback(
		(event: MouseEvent<HTMLDivElement>) => {
			if (!taskNewRef.current) {
				return;
			}

			const rectTask = taskNewRef.current.getBoundingClientRect();
			const offsetX = event.clientX - rectTask.left;
			const snappedOffsetX = offsetX - (offsetX % GRID_WIDTH);

			setTimelineX(snappedOffsetX);
			setDateRangeFocused(..._getDateRange(offsetX, dateStart));
		},
		[setDateRangeFocused, dateStart],
	);

	const handleMouseLeave = useCallback(() => {
		setTimelineX(0);
		clearDateRangeFocused();
	}, [clearDateRangeFocused]);

	const handleClick = useCallback(() => {
		const dateRange = _getDateRange(timelineX, dateStart);
		if (taskId) {
			setTaskRange(taskId, ...dateRange);
		} else {
			createTask(...dateRange);
		}
	}, [timelineX, dateStart, taskId, setTaskRange, createTask]);

	const showPlaceholder = timelineX !== 0;

	if (!containerRef.current) return null;

	return (
		<div className="taskNew" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={handleClick} ref={taskNewRef}>
			{showPlaceholder && (
				<div
					className="taskContent__bar"
					style={{
						width: `${mockWidth}px`,
						transform: `translateX(${timelineX}px)`,
					}}
				/>
			)}
			{createPortal(
				<>
					{!showPlaceholder && (
						<div className="taskNew__action">
							<ButtonTaskNew hide="onOpen" />
						</div>
					)}
				</>,
				containerRef.current,
			)}
		</div>
	);
};

const _getDateRange = (offset: number, dateStart: Date): [Date, Date] => {
	const start = getDateFromOffset(offset, dateStart);
	const end = addDays(start, GANTT_NEW_TASK_SIZE_DAYS - 1);

	return [start, end];
};
