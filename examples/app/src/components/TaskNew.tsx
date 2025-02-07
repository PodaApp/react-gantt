import { MouseEvent, RefObject, useCallback, useRef, useState } from "react";

import { addDays } from "date-fns";
import { createPortal } from "react-dom";

import IconPlus from "../assets/plus.svg?react";
import { GANTT_NEW_TASK_SIZE_DAYS, GRID_WIDTH } from "../constants";
import { useGanttStore } from "../store/ganttStore";
import { getDateFromOffset } from "../utils/getDateFromOffset";
import "./TaskNew.css";

type Props = {
	containerRef: RefObject<HTMLDivElement>;
};

const mockWidth = GANTT_NEW_TASK_SIZE_DAYS * GRID_WIDTH;

export const TaskNew = ({ containerRef }: Props) => {
	const taskNewRef = useRef<HTMLDivElement>(null);

	const setDateRangeFocused = useGanttStore.use.setDateRangeFocused();
	const clearDateRangeFocused = useGanttStore.use.clearDateRangeFocused();
	const createTask = useGanttStore.use.createTask();
	const dateStart = useGanttStore.use.dateStart();

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
		createTask(..._getDateRange(timelineX, dateStart));
	}, [timelineX, createTask, dateStart]);

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
							<IconPlus /> New
						</div>
					)}
				</>,
				containerRef.current,
			)}
		</div>
	);
};

const _getDateRange = (offset: number, dateStart: number): [string, string] => {
	const start = getDateFromOffset(offset, dateStart);
	const end = addDays(start, GANTT_NEW_TASK_SIZE_DAYS - 1).toDateString();

	return [start, end];
};
