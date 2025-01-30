import { MouseEvent, RefObject, useCallback, useRef, useState } from "react";

import { addDays } from "date-fns";
import { createPortal } from "react-dom";

import { COL_WIDTH, GANTT_DEFAULT_NEW_TASK_SIZE } from "../constants";
import { useGanttStore } from "../store/ganttStore";
import { Plus } from "./Plus";
import "./TaskNew.css";

type Props = {
	containerRef: RefObject<HTMLDivElement>;
};

const mockWidth = GANTT_DEFAULT_NEW_TASK_SIZE * COL_WIDTH;

const getDateRangeFromOffset = (offset: number, dateStart: number): [string, string] => {
	const daysFromStart = offset / COL_WIDTH;
	const start = addDays(dateStart, daysFromStart).toDateString();
	const end = addDays(start, GANTT_DEFAULT_NEW_TASK_SIZE - 1).toDateString();

	return [start, end];
};

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
			const snappedOffsetX = offsetX - (offsetX % COL_WIDTH);

			setTimelineX(snappedOffsetX);
			setDateRangeFocused(...getDateRangeFromOffset(offsetX, dateStart));
		},
		[setDateRangeFocused, dateStart],
	);

	const handleMouseLeave = useCallback(() => {
		setTimelineX(0);
		clearDateRangeFocused();
	}, [clearDateRangeFocused]);

	const handleClick = useCallback(() => {
		createTask(...getDateRangeFromOffset(timelineX, dateStart));
	}, [timelineX, createTask, dateStart]);

	const showPlaceholder = timelineX !== 0;

	if (!containerRef.current) return null;

	return (
		<div className="taskNew" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={handleClick} ref={taskNewRef}>
			{showPlaceholder && (
				<div
					className="task__bar"
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
							<Plus /> New
						</div>
					)}
				</>,
				containerRef.current,
			)}
		</div>
	);
};
